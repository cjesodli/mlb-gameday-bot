const globalCache = require('./global-cache');
const globals = require('../config/globals');
const liveFeed = require('./livefeed');

module.exports = {
    process: (currentPlayJSON) => {
        let reply = '';
        if (!globalCache.values.game.startReported
            && currentPlayJSON.playEvents?.find(event => event?.details?.description === 'Status Change - In Progress')) {
            globalCache.values.game.startReported = true;
            reply += 'A game is starting!';
        }
        let lastEvent;
        if (currentPlayJSON.about?.isComplete
            || globals.EVENT_WHITELIST.includes((currentPlayJSON.result?.eventType || currentPlayJSON.details?.eventType))) {
            reply += getDescription(currentPlayJSON);
            if (currentPlayJSON.result?.isOut || currentPlayJSON.details?.isOut) {
                reply += ' **' + currentPlayJSON.count.outs + (currentPlayJSON.count.outs > 1 ? ' outs. **' : ' out. **');
            }
            if (!currentPlayJSON.reviewDetails?.inProgress
                && (currentPlayJSON.about?.isScoringPlay || currentPlayJSON.details?.isScoringPlay)) {
                reply = addScore(reply, currentPlayJSON);
            }
            if (!currentPlayJSON.about?.hasReview) {
                if (currentPlayJSON.playEvents) {
                    lastEvent = currentPlayJSON.playEvents[currentPlayJSON.playEvents.length - 1];
                    if (lastEvent?.details?.isInPlay) {
                        reply = addMetrics(lastEvent, reply);
                    }
                } else if (currentPlayJSON.details?.isInPlay) {
                    reply = addMetrics(currentPlayJSON, reply);
                }
            }
        }
        /* two kinds of objects get processed - "at bats", which will have a "result" object, and events within at bats, which put
            the same information in a "details" object. So we often have to check for both.
         */
        return {
            reply,
            isStartEvent: currentPlayJSON.playEvents?.find(event => event?.details?.description === 'Status Change - In Progress'),
            isOut: currentPlayJSON.result?.isOut || currentPlayJSON.details?.isOut,
            outs: currentPlayJSON.count?.outs,
            homeScore: (currentPlayJSON.result ? currentPlayJSON.result.homeScore : currentPlayJSON.details?.homeScore),
            awayScore: (currentPlayJSON.result ? currentPlayJSON.result.awayScore : currentPlayJSON.details?.awayScore),
            isComplete: currentPlayJSON.about?.isComplete,
            description: (currentPlayJSON.result?.description || currentPlayJSON.details?.description),
            event: (currentPlayJSON.result?.event || currentPlayJSON.details?.event),
            eventType: (currentPlayJSON.result?.eventType || currentPlayJSON.details?.eventType),
            isScoringPlay: (currentPlayJSON.about?.isScoringPlay || currentPlayJSON.details?.isScoringPlay),
            isInPlay: (lastEvent?.details?.isInPlay || currentPlayJSON.details?.isInPlay),
            playId: (lastEvent?.playId || currentPlayJSON.playId),
            metricsAvailable: (lastEvent?.hitData?.launchSpeed !== undefined || currentPlayJSON.hitData?.launchSpeed !== undefined),
            hitDistance: (lastEvent?.hitData?.totalDistance || currentPlayJSON.hitData?.totalDistance)
        };
    }
};

function addScore (reply, currentPlayJSON) {
    reply += '\n';
    const feed = liveFeed.init(globalCache.values.game.currentLiveFeed);
    let homeScore, awayScore;
    if (currentPlayJSON.result) {
        homeScore = currentPlayJSON.result.homeScore;
        awayScore = currentPlayJSON.result.awayScore;
    } else if (currentPlayJSON.details) {
        homeScore = currentPlayJSON.details.homeScore;
        awayScore = currentPlayJSON.details.awayScore;
    }
    reply += (feed.halfInning() === 'top'
        ? '# _' + feed.awayAbbreviation() + ' ' + awayScore + '_, ' +
        feed.homeAbbreviation() + ' ' + homeScore
        : '# ' + feed.awayAbbreviation() + ' ' + awayScore + ', _' +
        feed.homeAbbreviation() + ' ' + homeScore + '_');

    return reply;
}

function addMetrics (lastEvent, reply) {
    if (lastEvent.hitData.launchSpeed) { // this data can be randomly unavailable
        reply += '\n\n**Statcast Metrics:**\n';
        reply += 'Exit Velo: ' + lastEvent.hitData.launchSpeed + ' mph' +
            getFireEmojis(lastEvent.hitData.launchSpeed) + '\n';
        reply += 'Launch Angle: ' + lastEvent.hitData.launchAngle + '° \n';
        reply += 'Distance: ' + lastEvent.hitData.totalDistance + ' ft.\n';
        reply += 'xBA: Pending...';
        reply += lastEvent.hitData.totalDistance && lastEvent.hitData.totalDistance >= 300 ? '\nHR/Park: Pending...' : '';
    } else {
        reply += '\n\n**Statcast Metrics:**\n';
        reply += 'Data was not available.';
    }

    return reply;
}

function getFireEmojis (launchSpeed) {
    if (launchSpeed >= 95.0 && launchSpeed < 100.0) {
        return ' \uD83D\uDD25';
    } else if (launchSpeed >= 100.0 && launchSpeed < 110.0) {
        return ' \uD83D\uDD25\uD83D\uDD25';
    } else if (launchSpeed >= 110.0) {
        return ' \uD83D\uDD25\uD83D\uDD25\uD83D\uDD25';
    } else {
        return '';
    }
}

function getDescription (currentPlayJSON) {
    return (currentPlayJSON.result?.description || currentPlayJSON.details.description || '');
}
