import sanitizeHtml = require('sanitize-html');

export function sanitize(html: string) {
    return sanitizeHtml(html, {allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])});
}

export function truncate(s, len) {
    if (s.length > len)
        return s.substr(0, len) + '...';
    return s;
}

export function formatDate(date) {
    var month = ["Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"];
    var minutes = date.getMinutes();
    return date.getDate() + ' ' +
        month[date.getMonth()] + ' ' +
        date.getFullYear() + ' ' +
        date.getHours() + ':' +
        ((minutes < 10) ? '0' + minutes : minutes);
}
