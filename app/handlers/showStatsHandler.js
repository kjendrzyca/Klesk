'use strict';

import _ from 'lodash';
import getMatchRepresentation from '../getMatchRepresentation';

function _composeResultMessage(playerMatchesCount, playerWinsCount, playerMatches, requestingPlayerName) {
    let playerLossCount = playerMatchesCount - playerWinsCount;

    let message = 'Matches: ' + playerMatchesCount + ' / Wins: ' + playerWinsCount  + ' / Losses: ' + playerLossCount;

    let matchesStats = _.reduce(playerMatches, (result, match, matchIndex) => {
        let matchMessage = 'Match ' + (matchIndex + 1) + ': ' + getMatchRepresentation(match);

        result += matchMessage + _newLineIfNeeded(playerMatches.length, matchIndex);

        return result;
    }, '');

    return message + '\n' + matchesStats;
}

function _decorate(playerName, requestingPlayerName) {
    if (playerName === requestingPlayerName) {
        return '`' + playerName + '`';
    }

    return playerName;
}

function _newLineIfNeeded(playerMatchesCount, matchIndex) {
    return playerMatchesCount !== matchIndex + 1 ? '\n' : '';
}

let showStatsHandler = function(persistence) {
    return {
        makeItSo(parsedCommand, callback) {
            let ladderName = parsedCommand.arguments[1];
            let playerName = parsedCommand.playerName;

            if (!ladderName) {
                callback(new Error('Specify ladder name.'), null);
                return;
            }

            let filterFunction = (ladder) => {
                return ladder.name === ladderName;
            };

            let queryCallback = (error, ladder) => {
                let playerMatches = _.filter(ladder[0].matches, (match) => {
                    return match.player1 === playerName || match.player2 === playerName;
                });

                if (playerMatches.length === 0) {
                    callback(null, 'You didn\'t join this ladder.');
                    return;
                }

                let playerWins = _.filter(playerMatches, (match) => {
                    return match.winner === playerName;
                });

                let resultMessage = _composeResultMessage(playerMatches.length, playerWins.length, playerMatches, playerName);

                callback(null, resultMessage);
            };

            persistence.query(filterFunction, queryCallback);
        }
    };
};

export default showStatsHandler;