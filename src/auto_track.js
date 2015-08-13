var session = require('./session');
var parseUri = require('./parseuri');
module.exports = {
	sections: function () {
		var locationHashChanged = function (oldHash, newHash) {
			asa('sectionentered', newHash.substr(1));
		}
		var storedHash = '';
		window.setInterval(function () {
			if (window.location.hash != storedHash) {
				var newHash = window.location.hash;
				locationHashChanged(storedHash, newHash);
				storedHash = newHash;
			}
		}, 100);
	},

	links: function (domains) {
		var domainsTracked = domains;
		var tracker = function (ev) {
			var href = ev.target.href;
			if (href) {
				var destination = parseUri(href);
				if (domainsTracked.indexOf(destination.authority) > -1) {
					var alreadyHasParams = ev.target.href.indexOf('?') !== -1;
					href = href + (alreadyHasParams ? '&' : '?') + '__asa_partner_id=' + encodeURIComponent(window.asaId) + '&__asa_partner_sid=' + encodeURIComponent(session.getSessionId());
					ev.target.href = href;
				}
			}
		};
		document.addEventListener('mousedown', tracker);
		document.addEventListener('keyup', tracker);
		document.addEventListener('touchstart', tracker);
	}
}