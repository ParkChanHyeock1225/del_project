var JstreeSet = function (option) {
    this.options = option;
    this.JsDefault = {
        core: {
            multiple: false,
            check_callback: true,
            themes: { dots: false },
            data: option.data
        },
        search: {
            case_insensitive: true,
            show_only_matches: true
        }
    };
    var plugins = ["wholerow", "search"];

    if (option.ajax) {
        $.extend(true, this.JsDefault, {
            core: {
                data: {
                    type: "POST",
                    async: false,
                    cache: false,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    dataType: "json",
                    url: option.ajax.url,
                    data: option.ajax.data
                }
            }
        });
    }
    else
        $.extend(true, this.JsDefault.core.data, option.data);

    if (option.checkbox) {
        $.extend(true, this.JsDefault, {
            checkbox: { three_state: false },
            core: {
                multiple: true,
                check_callback: false,
                data: option.data
            }
        });
        plugins.push("checkbox");
    }
    if (option.dnd) {
        $.extend(true, this.JsDefault, {
            core: {
                check_callback: function (operation, node, node_parent, node_position, more) {
                    if (operation === "move_node") {
                        return option.dnd.check_callback(operation, node, node_parent, node_position, more);
                    }
                }
            }
        });
        plugins.push("dnd");
    }
    if (option.contextmenu) {
        $.extend(true, this.JsDefault, {
            "contextmenu": option.contextmenu
        });
        plugins.push("contextmenu");
    }

    this.JsDefault.plugins = plugins;
    //this.tree = $("#" + option.id).jstree(this.JsDefault);
    if (option.id) {
        this.tree = $("#" + option.id).jstree(this.JsDefault);
    }
    else if (option.className) {
        this.tree = $("." + option.className).jstree(this.JsDefault);
    }
    else {
        this.tree = option.target.jstree(this.JsDefault);
    }

    if (option.select_node) {
        this.tree.on("select_node.jstree", option.select_node);
    }
    if (option.dblclick) {
        this.tree.on("dblclick.jstree", option.dblclick);
    }
    if (option.loaded) {
        this.tree.on("loaded.jstree", option.loaded);
    }
    if (option.open_node) {
        this.tree.on("open_node.jstree", option.open_node);
    }
    if (option.after_open) {
        this.tree.on("after_open.jstree", option.after_open);
    }
    if (option.open_all) {
        this.tree.on("open_all.jstree", option.open_all);
    }
};

JstreeSet.prototype = {
    fnGetSelectNode: function () {
        var result = this.tree.jstree("get_selected", true)[0];
        if (!result)
            result = this.tree.jstree("get_node", "ul>li:first");
        return result;
    },
    fnRefresh: function () {
        this.fnDeSelect();
        this.tree.jstree("refresh");
    },
    fnGetNodeByID: function (id) {
        return this.tree.jstree("get_node", id);
    },
    fnGetSelectId: function () {
        return this.fnGetSelectNode().id;
    },
    fnRedRaw: function () {
        this.tree.jstree("redraw", true);
    },
    fnSetNodeID: function (node, id) {
        this.tree.jstree("set_id", node, id);
    },
    fnSetSelectNode: function (id) {
        var sender = this;
        sender.fnDeSelect();

        if (Array.isArray(id)) {
            for (var arr in id)
                sender.fnSetSingleSelect(id[arr]);
        }
        else
            sender.fnSetSingleSelect(id);
    },
    fnSetSingleSelect: function (id) {
        var sender = this;
        var jsonNodes = sender.tree.jstree(true).get_json("#", { "flat": true });

        var select_node = jsonNodes.FindArray("id", id);

        if (select_node.length > 0)
            sender.tree.jstree("select_node", id);
        else if (!sender.options.find)
            return;
        else {
            fnSetLoading("defLoading");
            setTimeout(function () {
                ajaxCall({
                    url: sender.options.url,
                    param: sender.options.find.data(id),
                    isloading: false,
                    func: function (data) {
                        var findJson = setInterval(function () {
                            try {
                                if (typeof data !== "object") {
                                    //eval(data);
                                    throw "";
                                }
                                for (var val in data) {
                                    var findNode = jsonNodes.FindArray("id", data[val][sender.options.find.key]);
                                    if (findNode.length === 0)
                                        continue;

                                    sender.tree.jstree("open_node", findNode[0].id);

                                    sender.tree.one("open_node.jstree", function () {
                                        jsonNodes = sender.tree.jstree(true).get_json('#', { "flat": true });
                                        if (jsonNodes.FindArray("id", id).length > 0) {
                                            clearInterval(findJson);
                                            sender.tree.jstree("select_node", id);
                                            $("#defLoading").remove();
                                        }
                                    });
                                }
                            } catch (e) {
                                $("#defLoading").remove();
                                clearInterval(findJson);
                            }
                        }, 100);
                    }
                });
            },100);
        }
    },
    fnGetPid: function () {
        var pid;
        var selectnode = this.tree.jstree("get_selected", true);
        if (selectnode.length === 0)
            pid = 0;
        else if (selectnode[0].a_attr.type == "item")
            pid = selectnode[0].parent;
        else
            pid = selectnode[0].id;

        return pid;
    },
    Destroy: function () {
        this.tree.jstree("destroy");
    },
    fnDeSelect: function () {
        this.tree.jstree("deselect_all");
    },
    fnCloseAll: function () {
        this.tree.jstree("close_all");
    },
    fnOpenAll: function () {
        this.tree.jstree("open_all");
    },
    fnDeleteNode: function () {
        this.tree.jstree("delete_node", this.fnGetSelectNode());
    },
    fnCreateNode: function (node, parent) {
        if (!parent) {
            parent = this.tree.jstree("get_selected", true)[0];
            if (!parent) {
                parent = "#";
            }
        }

        var nodeid = this.tree.jstree("create_node", parent, node, "last");
        return nodeid;
    },
    fnGetRootId: function (id) {
        if (!id) {
            id = this.fnGetSelectNode().id;
        }

        return this.tree.jstree(true).get_path(id, "//", true).split('/')[0];
    }
};

/**
 * 트리생성
 * @param {any} option target,ajaxUrl 필수
 */
function jstreeSet(option) {
    var data = new JstreeSet(option);
    return data;
}