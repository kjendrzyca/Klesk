'use strict';

import _ from 'lodash';

function decorate(playerName) {
    return '`' + playerName + '`';
}

function matchResultAdded(winner, loser, ladderName, score) {
    let notification = decorate(winner) + ' has won a match with ' + decorate(loser) + ' on ladder ' + decorate(ladderName);

    if (score) {
        notification += '\nmatch score - ' + _winningScoreFirst(score);
    }

    return notification;
}

function playerJoined(playerName, ladderName) {
    return 'Player ' + decorate(playerName) + ' has joined the ladder ' + decorate(ladderName);
}

function playerLeft(playerName, ladderName) {
    return decorate(playerName) + ' is no longer a part of the ladder ' + decorate(ladderName);
}

function newLadder(ladderName) {
    return 'Created new ladder: ' + decorate(ladderName);
}

function _individualScoresAscending(score) {
    let individualScores = _.map(score.split(':'), (individualScore) => { return parseInt(individualScore); });

    return _.sortBy(individualScores);
}

function _scoresRepresentation(leftScore, rightScore) {
    return leftScore + ':' + rightScore;
}

function _winningScoreFirst(score) {
    let scoresAscending = _individualScoresAscending(score);

    return _scoresRepresentation(scoresAscending[1], scoresAscending[0]);
}

function _losingScoreFirst(score) {
    let scoresAscending = _individualScoresAscending(score);

    return _scoresRepresentation(scoresAscending[0], scoresAscending[1]);
}

function _indicateWinner(playerName, match) {
    if (playerName === match.winner) {
        return decorate('+' + playerName);
    }

    return playerName;
}

function _getMatchRepresentation(match, mapName) {
    let matchScore = '';

    if (match.score) {
        matchScore = ' ';
        if (match.player1 === match.winner) {
            matchScore += _winningScoreFirst(match.score);
        }
        else {
            matchScore += _losingScoreFirst(match.score);
        }
    }

    return '[' + _indicateWinner(match.player1, match) + ' vs ' +  _indicateWinner(match.player2, match) + matchScore + ' on ' + mapName + ']';
}

function ranking(ladder) {
    let message = '`' + ladder.name + ' matches`\n';

    ladder.matches.forEach((match) => {
        message += _getMatchRepresentation(match, ladder.map) + '\n';
    });

    return message;
}

function playerStats(ladderName, playerWinsCount, notPlayedMatches, playerMatches, mapName) {
    let playerMatchesCount = playerMatches.length;

    let playerLossCount = playerMatchesCount - playerWinsCount - notPlayedMatches;

    let message = 'Ladder ' + decorate(ladderName) + '\n';
    message += 'Matches: ' + playerMatchesCount + ' / Wins: ' + playerWinsCount  + ' / Losses: ' + playerLossCount;

    let matchesStats = _.reduce(playerMatches, (result, match) => {
        let matchMessage = _getMatchRepresentation(match, mapName);

        result += matchMessage + '\n';

        return result;
    }, '');

    return message + '\n' + matchesStats;
}

function _getMapRepresentation(map) {
    let votes = '';
    _.forIn(map.votes, (voteValue, voteTag) => {
        votes += voteTag + ':' + voteValue + ' ';
    });
    return decorate(map.name) + ' ' + votes;
}

function mapList(maps) {
    var mapListMessage = '';
    _.forEach(maps, (map) => {
        mapListMessage += _getMapRepresentation(map) + '\n';
    });
    return mapListMessage;
}

function _getResolvedMatchWinner(match) {
    return match.winner === match.player1 ? match.player1 : match.player2;
}

function _getResolvedMatchLoser(match) {
    return match.winner === match.player1 ? match.player2 : match.player1;
}

function ladderFinished(ladder) {
    var notification = 'All matches in ' + decorate(ladder.name) + ' have been played!\n';

    var playerWins = _.countBy(ladder.matches, _getResolvedMatchWinner);
    var playerLosses = _.countBy(ladder.matches,  _getResolvedMatchLoser);

    let playerResults = [];

    _addResultsForPeopleWhoWonAnything(playerResults, playerWins, playerLosses);

    _addRemainingResultsForPeopleWhoDidNotWinEvenOnce(playerResults, playerLosses);

    let sortedPlayerResults = _.sortByOrder(playerResults, 'wins').reverse();

    return _.reduce(sortedPlayerResults, (message, playerResult) => {
        return message + decorate(playerResult.playerName) + ' ' + playerResult.wins + '/' + playerResult.losses + '\n';
    }, notification);
}

function _addResultsForPeopleWhoWonAnything(playerResults, playerWins, playerLosses) {
    _.forEach(playerWins, (wins, playerName) => {
        let playerResult = {
            playerName: playerName,
            wins: wins,
            losses: 0
        };

        if (_.has(playerLosses, playerName)) {
            playerResult.losses = playerLosses[playerName];
        }

        playerResults.push(playerResult);
    });
}

function _addRemainingResultsForPeopleWhoDidNotWinEvenOnce(playerResults, playerLosses) {
    _.forEach(playerLosses, (losses, playerName) => {
        if (!_.any(playerResults, {playerName: playerName})) {
            playerResults.push({
                playerName: playerName,
                wins: 0,
                losses: losses
            });
        }
    });
}

function playerFinishedLadder(ladder, playerName) {
    let notification = 'You played all matches in ladder ' + decorate(ladder.name) + '\n';

    let playerMatches = _.filter(ladder.matches, (match) => {
        return match.player1 === playerName || match.player2 === playerName;
    });

    let winCount = _.filter(playerMatches, {winner: playerName}).length;
    let lossCount = playerMatches.length - winCount;

    notification += 'Your stats are: ' + winCount + '/' + lossCount;

    return notification;
}

export default {
    notifications: {
        matchResultAdded: matchResultAdded,
        playerJoined: playerJoined,
        playerLeft: playerLeft,
        newLadder: newLadder,
        ladderFinished: ladderFinished,
        playerFinishedLadder: playerFinishedLadder
    },
    decorate: decorate,
    ranking: ranking,
    playerStats: playerStats,
    mapList: mapList
};