var gitblog = function(config) {
    var self = this;

    self.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }

    self.options = {
        id: null,
        label: null,
        q: null,
        page: 1,
        token: null,
        code: null,
        redirect_url: null,
    }

    self.set = function() {
        if (self.getUrlParam('id') != undefined) {
            self.options.id = parseInt(self.getUrlParam('id'));
        }
        if (self.getUrlParam('label') != undefined) {
            self.options.label = self.getUrlParam('label');
        }
        if (self.getUrlParam('q') != undefined) {
            self.options.q = self.getUrlParam('q');
        }
        if (self.getUrlParam('page') != undefined) {
            self.options.page = parseInt(self.getUrlParam('page'));
        }
        if (self.getUrlParam('access_token') != undefined) {
            self.options.token = self.getUrlParam('access_token');
        }
        if (self.getUrlParam('code') != undefined) {
            self.options.code = self.getUrlParam('code');
        }
        if (self.getUrlParam('state') != undefined) {
            self.options.redirect_url = self.getUrlParam('state');
        }

        if (self.options.code != null && self.options.redirect_url != null) {
            window.location.href = config.server_link + "?code=" + self.options.code + "&redirect_url=" + self.options.redirect_url + "&client_id=" + config.client_id + "&client_secret=" + config.client_secret;
        }
    }

    self.set();

    self.utc2localTime = function(time) {
        var time_string_utc_epoch = Date.parse(time);
        var unixTimestamp = new Date(time_string_utc_epoch);
        var year = unixTimestamp.getFullYear();
        var month = unixTimestamp.getMonth() + 1;
        var date = unixTimestamp.getDate();
        var hour = unixTimestamp.getHours();
        var minute = unixTimestamp.getMinutes();
        var second = unixTimestamp.getSeconds();
        hour = (hour<10)?'0'+hour:hour;
        minute = (minute<10)?'0'+minute:minute;
        second = (second<10)?'0'+second:second;
        return year+'年'+month+'月'+date+'日'+' '+hour+':'+minute+':'+second;
    }

    String.prototype.replaceAll = function(a, b) {
        return this.replace(new RegExp(a, 'gm'), b);
    }

    var Info = function() {
        this.title = config.title;
        this.title_header = config.title;
        this.instruction = config.instruction;
    }

    Info.prototype.init = function() {
        $('#title').text(this.title);
        $('#title_header').text(this.title_header);
        $('#instruction').text(this.instruction);
        document.getElementsByTagName("title")[0].innerText = this.title;
    }

    var Menu = function() {
        this.labels = [];
    }

    Menu.prototype = {
        searchOnblur: function() {
            if ($('.search-input').val() == "") {
                $(".search-input").css("width", '42px');
                $(".search-input").css("z-index", -1);
            }
        },
        show: function() {
            var menu = this;
            for(var name in config.menu) {
                document.getElementById("menu").innerHTML += '<li class="nav-item"><a href="' + config.menu[name] + '" class="nav-link" target="_blank"><i class="ni ni-book-bookmark d-lg-none"></i><span class="nav-link-inner--text">' + name + '</span></a></li>';
            }
            if (Object.keys(config.friends).length != 0) {
                var menu_friend = document.getElementById("friends");
                menu_friend.innerHTML = '';
                for (var name in config.friends) {
                    menu_friend.innerHTML += '<li><a class="wp-block-friends__friends-title" href="' + config.friends[name] + '" target="_blank">' + name + '</a></li>';
                }
            }
            $(".search-input").on("blur",
            function() {
                menu.searchOnblur();
            });
        }
    }

    var Pages = function() {
        this.page = 1;
        this.pages = 1;
        this.itemNum = 0;
        this.pageLimit = 7;
    }

    Pages.prototype = {
        getNum: function(request_url) {
            var page = this;
            if (self.options.page != null && self.options.page != undefined) {
                page.page = self.options.page;
            }
            $.ajax({
                type: 'get',
                url: request_url,
                success: function(data) {
                    if (self.options.label != null && self.options.label != undefined) {
                        page.itemNum = data.length;
                    } else if(self.options.q != null && self.options.q != undefined) {
                        page.itemNum = data.total_count;
                    } else if (self.options.id != null && self.options.id != undefined) {
                        page.itemNum = data.length;
                        document.getElementById('comments-num').innerHTML = page.itemNum;
                    } else {
                        page.itemNum = data.open_issues_count;
                    }
                    if (page.itemNum > 10) {
                        page.pages = Math.ceil(page.itemNum / 10);
                        page.show();
                    }
                }
            });
        },
        show: function() {
            var page = this;
            $('#pages').css('display', 'inline-block');
            document.getElementById('pages').innerHTML = '<li class="page-item" id="last_page"><a aria-label="Previous Page" class="page-link" id="last"><i class="fa fa-angle-left" aria-hidden="true"></i></a></li>';
            if (page.pages <= page.pageLimit) {
                for (var i = 1; i <= page.pages; i++) {
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + i + '">' + i + '</a></li>';
                }
            } else {
                if (page.page >= 5) {
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page1">1</a></li>';
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" style="pointer-events: none;">...</a></li>';
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + (page.page - 1) + '">' + (page.page - 1) + '</a></li>';
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + page.page + '">' + page.page + '</a></li>';
                } else {
                    for (var i = 1; i <= page.page; i++) {
                        document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + i + '">' + i + '</a></li>';
                    }
                }
                if (page.page <= page.pages - 4) {
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + (page.page + 1) + '">' + (page.page + 1) + '</a></li>';
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" style="pointer-events: none;">...</a></li>';
                    document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + page.pages + '">' + page.pages + '</a></li>';
                } else {
                    for (var i = page.page + 1; i <= page.pages; i++) {
                        document.getElementById('pages').innerHTML += '<li class="page-item"><a class="page-link" id="page' + i + '">' + i + '</a></li>';
                    }
                }
            }
            document.getElementById('pages').innerHTML += '<li class="page-item" id="next_page"><a class="page-link" id="next"><i class="fa fa-angle-right" aria-hidden="true"></i></a></li>';
            for (var i = 1; i <= page.pages; i++) {
                if (self.options.label != undefined) {
                    $('#page' + i).click(function() {
                        window.location.href = "?label=" + self.options.label + "&page=" + this.innerHTML;
                    });
                } else if (self.options.id != undefined) {
                    $('#page' + i).click(function() {
                        window.location.href = "?id=" + self.options.id + "&page=" + this.innerHTML;
                    });
                } else if(self.options.q != undefined) {
                    $('#page' + i).click(function() {
                        window.location.href = "?q=" + self.options.q + "&page=" + this.innerHTML;
                    });
                } else {
                    $('#page' + i).click(function() {
                        window.location.href = "?page=" + this.innerHTML;
                    });
                }
                if (i == page.page) {
                    $('#page' + i).addClass('active');
                } else {
                    $('#page' + i).removeClass('active');
                }
            }
            if (page.page == 1) {
                $('#last_page').css('pointer-events', 'none');
                $('#next_page').css('pointer-events', 'auto');
            } else if (page.page == page.pages) {
                $('#last_page').css('pointer-events', 'auto');
                $('#next_page').css('pointer-events', 'none');
            }
            document.getElementById('last').onclick = function() {
                page.last();
            }
            document.getElementById('next').onclick = function() {
                page.next();
            }
        },
        last: function() {
            this.page--;
            if (self.options.label != undefined) {
                window.location.href = '?label=' + self.options.label + '&page=' + this.page;
            } else if (self.options.id != undefined && self.options.id != null) {
                window.location.href = '?id=' + self.options.id + '&page=' + this.page;
            } else {
                window.location.href = '?page=' + this.page;
            }
        },
        next: function() {
            this.page++;
            if (self.options.label != undefined) {
                window.location.href = '?label=' + self.options.label + '&page=' + this.page;
            } else if (self.options.id != undefined && self.options.id != null) {
                window.location.href = '?id=' + self.options.id + '&page=' + this.page;
            } else {
                window.location.href = '?page=' + this.page;
            }
        }
    }

    var Reaction = function() {
        this.num = 0;
        this.isLike = false;
    }

    Reaction.prototype = {
        like: function(type, id) {
            var reaction = this;
            if (reaction.isLike == true) return;
            if (window.localStorage.access_token == undefined || window.localStorage.access_token == null) {
                alert("请先登录！");
                return;
            }
            var request_url = '';
            if (type == 'issue') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + id + '/reactions';
            } else if (type == 'comment') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/comments/' + id + '/reactions';
            }
            $.ajax({
                type: "post",
                url: request_url,
                headers: {
                    Authorization: 'Basic ' + window.localStorage.authorize,
                    Accept: 'application/vnd.github.squirrel-girl-preview+json'
                },
                data: JSON.stringify({
                    "content": "heart"
                }),
                success: function() {
                    reaction.num += 1;
                    reaction.isLike = true;
                    reaction.show(type, id);
                }
            });
        },
        getNum: function(type, id) {
            var reaction = this;
            var request_url = '';
            if (type == 'issue') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + id + '/reactions';
            } else if (type == 'comment') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/comments/' + id + '/reactions';
            }
            $.ajax({
                type: "get",
                url: request_url + '?content=heart',
                headers: {
                    Accept: 'application/vnd.github.squirrel-girl-preview+json'
                },
                success: function(data) {
                    for (var i in data) {
                        if (data[i].user.login == window.localStorage.name) {
                            reaction.isLike = true;
                        }
                    }
                    reaction.num = data.length;
                    reaction.show(type, id);
                }
            });
        },
    }

    var commentItem = function() {
        this.reaction = new Reaction();
    }

    var Comment = function() {
        this.login = false;
        this.item = [];
    }

    Comment.prototype = {
        send: function() {
            var comment = this;
            var input = document.getElementById('comment-input').value;
            $.ajax({
                type: "post",
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + self.options.id + '/comments',
                headers: {
                    Authorization: 'Basic ' + window.localStorage.authorize,
                    Accept: 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "body": input
                }),
                dataType: "json",
                success: function(data) {
                    if (data.id != undefined) {
                        document.getElementById('comment-input').value = "";
                        comment.addComment(data);
                        document.getElementById('comments-num').innerHTML++;
                    }
                }
            });
        },
        init: function() {
            var comment = this;
            comment.checkIsLogin();
            $.ajax({
                type: 'get',
                headers: {
                    Accept: 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json, application/x-www-form-urlencoded',
                },
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + self.options.id + '/comments?page=' + self.options.page + '&per_page=10',
                success: function(data) {
                    document.getElementById('comment-list').innerHTML = "";
                    for (var i in data) {
                        comment.addComment(data[i]);
                    }
                }
            });

            var login = document.getElementById('login');
            if (comment.login == false) {
                login.innerHTML = '<a class="gitment-editor-login-link" id="log">登入</a> with GitHub';
            } else {
                login.innerHTML = '<a class="gitment-editor-login-link" id="log">登出</a>';
            }

            document.getElementById('log').onclick = function() {
                if (comment.login == false) {
                    comment.log();
                } else {
                    comment.logout();
                }
            }

            var editor_content = document.getElementById('write-field');
            if (comment.login == false) {
                editor_content.innerHTML = '<textarea placeholder="(发表评论)" title="请登入以发表评论" disabled id="comment-input"></textarea>';
                $('.gitment-editor-submit').attr("disabled", true);
            } else {
                editor_content.innerHTML = '<textarea placeholder="(发表评论)" id="comment-input"></textarea>';
                $('.gitment-editor-submit').attr("disabled", false);
            }

            $('#editComment').click(function() {
                comment.edit();
            });
            $('#preview').click(function() {
                comment.preview();
            });
            $('.gitment-editor-submit').click(function() {
                comment.send();
            });
        },
        addComment: function(data) {
            var comment = new commentItem();
            data.created_at = self.utc2localTime(data.created_at);
            document.getElementById('comment-list').innerHTML += '<li class="gitment-comment">' + '<a class="gitment-comment-avatar" href=' + data.user.html_url + ' target="_blank">' + '<img class="gitment-comment-avatar-img" src=' + data.user.avatar_url + '></a>' + '<div class="gitment-comment-main"><div class="gitment-comment-header">' + '<a class="gitment-comment-name" href=' + data.user.html_url + ' target="_blank">' + data.user.login + '</a> 评论于 ' + '<span>' + data.created_at + '</span>' + '<div style="float:right;cursor:pointer" id="' + data.id + '"></div>' + '</div><div class="gitment-comment-body gitment-markdown">' + data.body_html + '</div></div>';
            comment.reaction.getNum('comment', data.id);
            this.item.push(comment);
        },
        checkIsLogin: function() {
            var comment = this;
            if (window.localStorage.access_token != undefined) {
                this.login = true;
            }
            var avatar = document.getElementById('avatar');
            if (this.login == true) {
                $.ajax({
                    type: "get",
                    async: false,
                    headers: {
                        Authorization: 'token ' + window.localStorage.access_token,
                        Accept: 'application/vnd.github.squirrel-girl-preview+json'
                    },
                    url: 'https://api.github.com/user',
                    success: function(data) {
                        window.localStorage.setItem('user_avatar_url', data.avatar_url);
                        window.localStorage.setItem('user_url', data.html_url);
                        window.localStorage.setItem('name', data.login);
                        avatar.innerHTML = '<a class="gitment-comment-avatar" href=' + window.localStorage.user_url + ' target="_blank">' + '<img class="gitment-comment-avatar-img" src=' + window.localStorage.user_avatar_url + '></a>';
                        window.localStorage.setItem('authorize', btoa(data.login + ':' + window.localStorage.access_token));
                    },
                    error: function() {
                        console.log("用户信息过期，退出登录状态");
                        comment.logout();
                    }
                });
            } else {
                avatar.innerHTML = '<a class="gitment-editor-avatar" id="gitment-avatar" title="login with GitHub">' + '<img src="images/gitment-github-icon.svg" class="gitment-github-icon" style="width:44px">' + '</a></div>';
                document.getElementById('gitment-avatar').onclick = function() {
                    comment.log();
                }
            }
        },
        preview: function() {
            $('#editComment').removeClass('gitment-selected');
            $('#preview').addClass('gitment-selected');
            $('.gitment-editor-write-field').addClass('gitment-hidden');
            $('.gitment-editor-preview-field').removeClass('gitment-hidden');
            var preview_content = document.getElementById('preview-content');
            var comment_input = document.getElementById('comment-input').value;
            if (comment_input == "") {
                preview_content.innerHTML = '（预览找不到啦）';
            } else {
                preview_content.innerHTML = '预览正在加载喵';
                $.ajax({
                    type: "post",
                    url: 'https://api.github.com/markdown',
                    headers: {
                        Accept: 'text/html, application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json, application/x-www-form-urlencoded',
                        'Content-Type': 'text/html'
                    },
                    data: JSON.stringify({
                        mode: 'gfm',
                        text: comment_input
                    }),
                    dataType: "text/html",
                    success: function(message) {
                        preview_content.innerHTML = message.responseText;
                    },
                    error: function(message) {
                        preview_content.innerHTML = message.responseText;
                    }
                });
            }
        },
        edit: function() {
            $('#editComment').addClass('gitment-selected');
            $('#preview').removeClass('gitment-selected');
            $('.gitment-editor-write-field').removeClass('gitment-hidden');
            $('.gitment-editor-preview-field').addClass('gitment-hidden');
        },
        log: function() {
            window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + config.client_id + '&scope=public_repo&state=' + window.location.href;
        },
        logout: function() {
            this.login = false;
            window.localStorage.clear();
            this.init();
        }
    }
    
    var Issue = function() {
        this.issue_url = '';
        this.issue_perpage_url = '';
        this.issue_search_url = '';
        this.author = '';
        this.creator = '',
        this.state = '';
        this.page = new Pages();
    }

    Issue.prototype = {
        getTags: function() {
            $.ajax({
                type: 'get',
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/labels',
                success: function(data) {
                    for (var i in data) {
                        document.getElementById('tags').innerHTML += '<li class="nav-item"><a href="/?label=' + data[i].name + '" class="nav-link"><i class="ni ni-book-bookmark d-lg-none"></i><span class="nav-link-inner--text">' + data[i].name + '</span></a></li>';
                    }
                },
            });
        },
        addItem: function(data) {
            document.getElementById('issue-list').innerHTML = '<div class="waterflow-placeholder" style="height: 0px;"></div>';
            for (var i in data) {
                var labels_content = '';
                for (var j in data[i].labels) {
                    labels_content += '<i class="fa fa-bookmark-o" aria-hidden="true"></i><a href=/?label=' + data[i].labels[j].name + ' class="post-meta-detail-catagory-link">' + data[i].labels[j].name + '</a>';
                }
                data[i].body = data[i].body.replace(/<.*?>/g, "");
                data[i].created_at = self.utc2localTime(data[i].created_at);
                document.getElementById('issue-list').innerHTML += '<article class="post card bg-white shadow-sm border-0 post-preview post-preview-layout-2" id="' + data[i].number + '"><header class="post-header"></header><div class="post-content-container"><a class="post-title" href="/?id=' + data[i].number + '">' + data[i].title + '</a><div class="post-content">' + data[i].body + '</div><div class="post-meta"><div class="post-meta-detail post-meta-detail-time"><i class="fa fa-clock-o" aria-hidden="true"></i><time>' + data[i].created_at + '</time></div><div class="post-meta-devide">|</div><div class="post-meta-detail post-meta-detail-author"><i class="fa fa-user-circle-o" aria-hidden="true"></i><a href="https://github.com/' + data[i].user.login + '" target="_blank">' + data[i].user.login + '</a></div><div class="post-meta-devide">|</div><div class="post-meta-detail post-meta-detail-categories">' + labels_content + '</div></div></div></article>';
            }
        },
        show: function(request_url) {
            var issue = this;
            $.ajax({
                type: 'get',
                url: request_url + 'page=' + self.options.page + '&per_page=10',
                success: function(data) {
                    if (self.options.q == undefined || self.options.q == null) {
                        if (data.length == 0) {
                            document.getElementById('issue-list').innerHTML = '<h4 class="title">这里什么都没有喵~</h4>';
                            $('.footer').css('position', 'absolute');
                        } else {
                            issue.addItem(data);
                        }
                    } else {
                        if (data.items.length == 0) {
                            window.location.href = '404.html';
                        } else {
                            issue.addItem(data.items);
                        }
                        var html = document.getElementById('issue-list').innerHTML;
                        var newHtml;
                        if(self.options.q != '')
                            newHtml = html.replaceAll(self.options.q, '<font style="background-color:yellow;">' + self.options.q + '</font>');
                        else
                            newHtml = html;
                        document.getElementById('issue-list').innerHTML = newHtml;
                    }
                }
            });
        },
        init: function() {
            if(config.filter.creator != undefined && config.filter.creator != null) {
                if(config.filter.creator == 'all') {
                    this.author = '';
                    this.creator = '';
                } else {
                    var authors= new Array();
                    authors = config.filter.creator.split(",");
                    for(var i in authors) {
                        this.author += 'author:' + authors[i] + '+';
                        this.creator += 'creator=' + authors[i] + '&';
                    }
                }
            } else {
                this.author = '';
                this.creator = '';
            }
            if(config.filter.state != undefined && config.filter.state != null) {
                this.state = config.filter.state;
            } else {
                this.state = 'all';
            }
            if (self.options.label == undefined) {
                if (self.options.q == undefined) {
                    this.issue_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo;
                    this.issue_perpage_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues?' + this.creator + 'state=' + this.state + '&';
                } else {
                    this.search(self.options.q);
                }
            } else {
                this.issue_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues?' + this.creator + 'labels=' + self.options.label + '&state=' + this.state;
                this.issue_perpage_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues?' + this.creator + 'labels=' + self.options.label + '&state=' + this.state + '&';
                document.getElementById('title').innerHTML = self.options.label;
                $.ajax({
                    type: 'get',
                    headers: {
                        Accept: 'application/vnd.github.symmetra-preview+json',
                    },
                    url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/labels/' + self.options.label,
                    success: function(data) {
                        document.getElementById('instruction').innerHTML = data.description;
                    }
                });
            }
            this.page.getNum(this.issue_url);
            this.show(this.issue_perpage_url);
            this.getTags();
        },
        search: function(search) {
            search = encodeURI(search);
            this.issue_url = 'https://api.github.com/search/issues?q=' + search + ' ' + this.author + 'in:title,body+repo:' + config.name + '/' + config.repo + '+state:' + this.state;
            this.issue_perpage_url = 'https://api.github.com/search/issues?q=' + search + ' ' + this.author + 'in:title,body+repo:' + config.name + '/' + config.repo + '+state:' + this.state + '&';
        }
    }
        
    var Article = function() {
        this.comments = new Comment();
        this.page = new Pages();
        this.reaction = new Reaction();
        this.comment_url = "";
    }

    Article.prototype = {
        getTags: function() {
            $.ajax({
                type: 'get',
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/labels',
                success: function(data) {
                    for (var i in data) {
                        document.getElementById('tags').innerHTML += '<li class="nav-item"><a href="/?label=' + data[i].name + '" class="nav-link"><i class="ni ni-book-bookmark d-lg-none"></i><span class="nav-link-inner--text">' + data[i].name + '</span></a></li>';
                    }
                },
            });
        },
        init: function() {
            var article = this;
            if (self.options.token != undefined && self.options.token != null) {
                window.localStorage.clear();
                window.localStorage.setItem("access_token", self.options.token);
                history.replaceState(null, config.title, '/?id=' + self.options.id);
            }
            article.comment_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + self.options.id + '/comments';
            article.page.getNum(article.comment_url);
            $.ajax({
                type: 'get',
                headers: {
                    Accept: 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json, application/x-www-form-urlencoded',
                },
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + self.options.id,
                success: function(data) {
                    document.getElementById('title').innerHTML = config.title;
                    document.getElementsByTagName("title")[0].innerText = data.title + "|" + config.title;
                    data.created_at = self.utc2localTime(data.created_at);
                    document.getElementById('instruction').innerHTML = config.instruction;
                    document.getElementById('issue-list').innerHTML = '<article class="post post-full card bg-white shadow-sm border-0" id="' + self.options.id + '"><header class="post-header text-center"><a class="post-title" href="/?id=' + self.options.id + '">' + data.title + '</a><div class="post-meta"><div class="post-meta-detail post-meta-detail-time"><i class="fa fa-clock-o" aria-hidden="true"></i><time title="' + data.created_at + '">' + data.created_at + '</time></div><div class="post-meta-devide">|</div><div class="post-meta-detail post-meta-detail-author"><i class="fa fa-user-circle-o" aria-hidden="true"></i><a href="" target="_blank"></a></div><div class="post-meta-devide">|</div><div class="post-meta-detail post-meta-detail-categories"><i class="fa fa-bookmark-o" aria-hidden="true"></i><a href="" target="_blank" class="post-meta-detail-catagory-link"></a></div></div></header>
<div class="post-content" id="post_content">' + data.body_html + '<div class="uwp_widgets uwp_widget_author_box bsui sdel-fa446a3f">
<div class="d-block text-center text-md-left d-md-flex p-3 bg-light" style="">

<a href="https://www.latife.me/profile/misaka20002/">
<img src="https://www.latife.me/wp-content/uploads/2022/12/9c3de6b02fee2318e3fd89f005318ce5_uwp_avatar_thumb.png" class="rounded-circle shadow border border-white border-width-4 mr-3" width="60" height="60" alt="御坂20002号?"></a>

<div class="media-body">

<h5 class="mt-0">Author: 
<a href="https://www.latife.me/profile/misaka20002/">御坂 20002 号？</a></h5>

<div class="uwp-button-group bsui sdel-37e9bcf5">
<div class="bsui-button-group">

<a href="https://blog.misakanetwork.site/" target="_blank" title="" class=" btn-website ml-1 mb-1 border-0 btn btn-sm btn-circle" data-toggle="tooltip" data-original-title="网站">
<i class="fas fa-link fa-fw fa-lg"></i></a>
</div>
</div>

<p>クトリ・ノタ・セニオリス</p>
</div>
</div></div> </div>
</article>
';
                    var labels = document.getElementById('labels');
                    for (var i in data.labels) {
                        labels.innerHTML += '<a href="/?label=' + data.labels[i].name + '"># ' + data.labels[i].name + '</a>';
                    }
                    labels.innerHTML += '<div style="float:right;cursor:pointer" id="' + self.options.id + '"></div>';
                    article.comments.init();
                    article.reaction.getNum('issue', self.options.id);
                }
            });
            this.getTags();
        }
    }

    var Buttons = function() {}

    Buttons.prototype = {
        getByClass: function(Parent, Class){
            var result=[];
            var ele=Parent.getElementsByTagName('*');
            for(var i=0;i<ele.length;i++){
                if(ele[i].className==Class)
                {
                    result.push(ele[i]);
                }
            }
            return result;
        },
        init: function() {
            $('.navi-button').click(function() {
                if ($('.main').css("transform") == "matrix(1, 0, 0, 1, 0, 0)") {
                    $('.main').css("transform", "translateX(-150px)");
                    $('.main-navication span').css("opacity", "1");
                    $('.main-navication').css("opacity", "1");
                    $('.main-navication span').css("transform", "translateX(-10px)");
                    $('.navi-button').css("transform", "translateX(-150px)");
                    $('.Totop').css("transform", "translateX(-150px)");
                    $('.search').css("transform", "translateX(-150px)");
                    $('.search-input').css("transform", "translateX(-150px)");
                }
            });

            $('.search').click(function() {
                $(".search-input").css('z-index', 99);
                $(".search-input").css("width", '300px');
                $(".search-input").focus();
            });

            $('.search-input').bind('keypress',
            function(event) {
                if (event.keyCode == "13" && $('.search-input').val() != "") {
                    window.location.href = '/?q=' + $('.search-input').val();
                }
            })
        }
    }

    self.init = function() {
        self.info = new Info();
        self.info.init();
        if (self.options.id != null && self.options.id != undefined) {
            self.content = new Article();
            self.content.init();
        } else {
            self.content = new Issue();
            self.content.init();
        }
        self.menu = new Menu();
        self.menu.show();
        self.button = new Buttons();
        self.button.init();
    }
}

$.ajax({
    type: 'get',
    headers: {
        Accept: 'application/json',
    },
    url: 'config.json',
    success: function(data) {
        new gitblog(data).init();
    }
});
