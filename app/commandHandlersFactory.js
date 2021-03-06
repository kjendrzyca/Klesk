'use strict';

import Persistence from 'JsonPersistence';

import newLadderHandler from './handlers/newLadderHandler';
import joinLadderHandler from './handlers/joinLadderHandler';
import leaveLadderHandler from './handlers/leaveLadderHandler';
import addResultHandler from './handlers/addResultHandler';
import showStatsHandler from './handlers/showStatsHandler';
import rankingHandler from './handlers/rankingHandler';
import {mapUpVoteHandler, mapDownVoteHandler} from './maps/mapVoteHandlers';
import listMapsHandler from './maps/listMapsHandler';
import showLaddersHandler from './handlers/showLaddersHandler';
import newSeasonHandler from './handlers/newSeasonHandler';
import thisIsNotTheCommandYouAreLookingFor from './handlers/nullHandler';
import validateLadderExistenceDecorator from './validation/validateLadderExistenceDecorator.js';
import config from '../config';
import logger from './logger';
import commandTypes from './commandTypes';

let getCommandHandler = (commandType, callback) => {
    let ladderPersistence = new Persistence(config.storageFilename);
    ladderPersistence.init((error) => {
        logger(error);

        let mapPersistence = new Persistence(config.mapsFilename);

        switch (commandType) {
            case commandTypes.NEWLADDER:
                mapPersistence.init((mapPersistenceError => {
                    logger(mapPersistenceError);
                    callback(newLadderHandler(ladderPersistence, mapPersistence));
                }));
                break;

            case commandTypes.JOINLADDER:
                callback(validateLadderExistenceDecorator(joinLadderHandler(ladderPersistence), ladderPersistence));
                break;

            case commandTypes.LEAVELADDER:
                callback(validateLadderExistenceDecorator(leaveLadderHandler(ladderPersistence), ladderPersistence));
                break;

            case commandTypes.ADDRESULT:
                callback(validateLadderExistenceDecorator(addResultHandler(ladderPersistence), ladderPersistence));
                break;

            case commandTypes.SHOWSTATS:
                callback(validateLadderExistenceDecorator(showStatsHandler(ladderPersistence), ladderPersistence));
                break;

            case commandTypes.RANKING:
                callback(validateLadderExistenceDecorator(rankingHandler(ladderPersistence), ladderPersistence));
                break;

            case commandTypes.SHOWLADDERS:
                callback(showLaddersHandler(ladderPersistence));
                break;

            case commandTypes.UPVOTEMAP:
                mapPersistence.init((mapPersistenceError) => {
                    logger(mapPersistenceError);
                    callback(mapUpVoteHandler(mapPersistence));
                });
                break;

            case commandTypes.DOWNVOTEMAP:
                mapPersistence.init((mapPersistenceError) => {
                    logger(mapPersistenceError);
                    callback(mapDownVoteHandler(mapPersistence));
                });
                break;

            case commandTypes.LISTMAPS:
                mapPersistence.init((mapPersistenceError) => {
                    logger(mapPersistenceError);
                    callback(listMapsHandler(mapPersistence));
                });
                break;

            case commandTypes.NEWSEASON:
                mapPersistence.init((mapPersistenceError => {
                    logger(mapPersistenceError);
                    callback(validateLadderExistenceDecorator(newSeasonHandler(ladderPersistence, mapPersistence), ladderPersistence));
                }));
                break;

            default:
                callback(thisIsNotTheCommandYouAreLookingFor());
        }
    });
};

export default {
    getCommandHandler: getCommandHandler
};
