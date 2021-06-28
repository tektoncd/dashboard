const scrollRegex = /(auto|scroll)/;


function getStyle(el, prop) {
    if (!el) {
        return "";
    }
    return window.getComputedStyle(el, null).getPropertyValue(prop);
}

function hasElementPositiveScrollBottom(el) {
    if (!isElementScrollable(el)) {
        return false;
    }
    return el.scrollHeight - el.clientHeight > el.scrollTop;
}

function hasElementPositiveScrollTop(el) {
    if (!isElementScrollable(el)) {
        return false;
    }
    return el.scrollTop > 0;
}

function isElementStartAboveViewTop(el) {
    if (!el) {
        return false;
    }
    return el.getBoundingClientRect().top < 0;
}

function isElementEndBelowViewBottom(el) {
    if (!el) {
        return false;
    }
    return el.getBoundingClientRect().bottom >
        (window.innerHeight || document.documentElement.clientHeight);
}

function isElementScrollable(el, includeHorizontalScroll = false) {
    if (!el) {
        return false;
    }

    const horizontalScroll = includeHorizontalScroll ? "" : getStyle(el, "overflow-x");
    return scrollRegex.test(
        getStyle(el, "overflow") +
        getStyle(el, "overflow-y") + horizontalScroll);
}

const utils = {
    hasElementPositiveScrollBottom,
    hasElementPositiveScrollTop,
    isElementStartAboveViewTop,
    isElementEndBelowViewBottom,
};
export default utils;