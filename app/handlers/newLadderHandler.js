'use strict';

import _ from 'lodash';

function Ladder(name) {
    return {
        name: name,
        matches: []
    };
}

let newLadderHandler = function(persistence) {

    function _prepareLadderExistsErrorMessage(ladderName) {
        return 'Ladder `' + ladderName + '` already exists.';
    }

    return {
        makeItSo(parsedCommand, callback) {
            let ladderName = parsedCommand.arguments[1];

            persistence.getAll((error, data) => {
                if (error) {
                    callback(error.message, null);
                    return;
                }

                let ladderAlreadyExists = _.any(data, { name: ladderName });
                if (ladderAlreadyExists) {
                    callback(null, _prepareLadderExistsErrorMessage(ladderName));
                    return;
                }

                persistence.add(Ladder(ladderName), (error) => {
                    if (error) {
                        callback(error.message, null);
                        return;
                    }

                    callback(null, 'Created new ladder: ' + ladderName);
                });
            });
        }
    };
};

export default newLadderHandler;