import Clipboard from 'clipboard';
import s from 'underscore.string';
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { t } from '../../utils/client';
import { chatMessages } from '../../ui/client';
import { Layout, modal, popover, fireGlobalEvent, RoomManager } from '../../ui-utils';
import { settings } from '../../settings';
import { ChatSubscription } from '../../models';

import './body.html';

Template.body.onRendered(function() {
	new Clipboard('.clipboard');

	$(document.body).on('keydown', function(e) {
		const unread = Session.get('unread');
		if (e.keyCode === 27 && (e.shiftKey === true || e.ctrlKey === true) && (unread != null) && unread !== '') {
			e.preventDefault();
			e.stopPropagation();
			modal.open({
				title: t('Clear_all_unreads_question'),
				type: 'warning',
				confirmButtonText: t('Yes_clear_all'),
				showCancelButton: true,
				cancelButtonText: t('Cancel'),
				confirmButtonColor: '#DD6B55',
			}, function() {
				const subscriptions = ChatSubscription.find({
					open: true,
				}, {
					fields: {
						unread: 1,
						alert: 1,
						rid: 1,
						t: 1,
						name: 1,
						ls: 1,
					},
				});

				subscriptions.forEach((subscription) => {
					if (subscription.alert || subscription.unread > 0) {
						Meteor.call('readMessages', subscription.rid);
					}
				});
			});
		}
	});

	$(document.body).on('keydown', function(e) {
		const { target } = e;
		if (e.ctrlKey === true || e.metaKey === true) {
			popover.close();
			return;
		}
		if (!((e.keyCode > 45 && e.keyCode < 91) || e.keyCode === 8)) {
			return;
		}

		if (/input|textarea|select/i.test(target.tagName)) {
			return;
		}
		if (target.id === 'pswp') {
			return;
		}

		popover.close();

		if (document.querySelector('.rc-modal-wrapper dialog[open]')) {
			return;
		}

		const inputMessage = chatMessages[RoomManager.openedRoom] && chatMessages[RoomManager.openedRoom].input;
		if (!inputMessage) {
			return;
		}
		inputMessage.focus();
	});

	const handleMessageLinkClick = (event) => {
		const link = event.currentTarget;
		if (link.origin === s.rtrim(Meteor.absoluteUrl(), '/') && /msg=([a-zA-Z0-9]+)/.test(link.search)) {
			fireGlobalEvent('click-message-link', { link: link.pathname + link.search });
		}
	};

	this.autorun(() => {
		if (Layout.isEmbedded()) {
			$(document.body).on('click', 'a', handleMessageLinkClick);
		} else {
			$(document.body).off('click', 'a', handleMessageLinkClick);
		}
	});

	this.autorun(function(c) {
		const w = window;
		const d = document;
		const script = 'script';
		const l = 'dataLayer';
		const i = settings.get('GoogleTagManager_id');
		if (Match.test(i, String) && i.trim() !== '') {
			c.stop();
			return (function(w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({
					'gtm.start': new Date().getTime(),
					event: 'gtm.js',
				});
				const f = d.getElementsByTagName(s)[0];
				const j = d.createElement(s);
				const dl = l !== 'dataLayer' ? `&l=${ l }` : '';
				j.async = true;
				j.src = `//www.googletagmanager.com/gtm.js?id=${ i }${ dl }`;
				return f.parentNode.insertBefore(j, f);
			}(w, d, script, l, i));
		}
	});
});
