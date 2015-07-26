'use strict';

import assert from 'assertthat';
import sinon from 'sinon';
import request from 'superagent';
import notification from '../app/notification.js';

let config = {
    notificationWebhookAddress: 'http://fakeNotificationAddress.com/notify',
    notificationChannel: '#vg',
    botUsername: 'Klesk'
};

notification.__Rewire__('config', config);

describe('notification', function() {
    let requestSpy;

    beforeEach(() => {
        requestSpy = sinon.spy(request, 'post');
    });

    afterEach(() => {
        request.post.restore();
    });

    it('should be sent when user joins ladder', function() {
        // when
        notification.send('user has joined');

        // then
        let expectedNotificationMessage = {
            username: config.botUsername,
            text: 'user has joined',
            channel: config.notificationChannel
        };

        assert.that(requestSpy.calledWith(config.notificationWebhookAddress, expectedNotificationMessage)).is.true();
    });
});