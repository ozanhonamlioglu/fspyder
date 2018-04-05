/*
    kernel.css v0.5.0
    MIT License
    github.com/ionogy/kernel.css
*/

var kernel = kernel || {};

(function(app) {
    'use strict';

    var getElementIndex = function(element) {
        var index = 0;

        while ((element = element.previousElementSibling)) {
            index++;
        }

        return index;
    };

    app.closeNotice = function(e) {
        var parent = e.currentTarget.parentNode;
        parent.remove();
    };

    var navIsToggled = false;

    /**
    * Toogle header navigation.
    **/

    app.toggleNav = function(e) {
        var navList = e.currentTarget.parentNode.querySelector('.ion-nav');

        navIsToggled = !navIsToggled;

        if (navIsToggled) {
            var navMobile = document.createElement('nav');
            navMobile.innerHTML = navList.innerHTML;
            navMobile.className = 'ion-nav-mobile';
            navMobile.style['z-index'] = '1000';

            document.body.appendChild(navMobile);
        } else {
            document.querySelector('.ion-nav-mobile').remove();
        }
    };

    var sidebar = document.querySelector('.ion-sidebar');
    var sidebarIsToggled = false;

    /**
    * Toggle the sidebar.
    **/

    app.toggleSidebar = function() {
        if (sidebarIsToggled) {
            sidebar.style.width = '60px';
        } else {
            sidebar.style.width = '220px';
        }

        sidebarIsToggled = !sidebarIsToggled;
    };

    app.tabs = function(tab) {
        app.initTabs(document.querySelectorAll(tab));
    };

    app.initTabs = function(tabs) {
        tabs.forEach(function(tab) {
            var tabNavigation = tab.querySelectorAll('ul:first-child li');
            var tabContent = tab.querySelectorAll('.ion-tab');

            tabNavigation.forEach(function(element) {
                element.onclick = function(event) {
                    tabContent.forEach(function(el) {
                        el.classList.remove('ion-tab-selected');
                    });

                    tabContent[getElementIndex(event.currentTarget)].classList.add('ion-tab-selected');

                    tabContent.forEach(function(el) {
                        if (el.classList.contains('ion-tab-selected')) {
                            el.style.display = 'block';
                        } else {
                            el.style.display = 'none';
                        }
                    });
                };
            });
        });
    };

    /**
    * Initializes dom elements.
    **/

    app.initEvents = function() {
        var navToggle = document.querySelectorAll('.ion-header .nav-toggle');
        var sidebarToggle = document.querySelector('.ion-sidebar ul li:first-child');
        var notice = document.querySelectorAll('.ion-notice .material-icons');
        var tabs = document.querySelectorAll('.ion-tabs');

        if (navToggle) {
            navToggle.forEach(function(element) {
                element.onclick = app.toggleNav;
            });
        }

        if (sidebarToggle) {
            sidebarToggle.onclick = app.toggleSidebar;
        }

        if (notice) {
            notice.forEach(function(element) {
                element.onclick = app.closeNotice;
            });
        }

        if (tabs) {
            app.initTabs(tabs);
        }
    };

    app.init = function() {
        app.initEvents();
    };

    /**
     * Progressbar.
     **/

    function ProgressBar(el) {
        this.el = document.querySelector(el);
    }

    ProgressBar.prototype.setProgress = function(progress) {
        this.el.querySelector('.ion-progress').style.width = progress + '%';
    };

    app.ProgressBar = ProgressBar;
})(kernel);

window.onload = kernel.init;
