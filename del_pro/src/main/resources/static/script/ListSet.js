var ListSet = function (option) {
    let sender = this;

    this.defaults = {
        pageCnt: 15, //페이지카운트
        NowPage: 1,
        columnKey: [ ],
        ajaxUrl: null,
        ajaxExcelUrl: null,
        ajaxParm: null,
        bindData: null,
        target: null,
        paginate: null,
        paginateTarget: null,
        bindColumn: null,
        isPagination: true,
        sort: null,
        recordAttr: null,
        lang: "ko",
        isLoad: true,
        view: {
            url: null,
            renderBody: "#renderBody",
            isPopup: false,
            popupName: null,
            popupTitle: null
        }
    };

    this.pagingDef = {
        first: "&nbsp;",
        prev: "&nbsp;",
        next: "&nbsp;",
        last: "&nbsp;",
        visiblePages: 10,
        paginationClass: "",
        pageClass: "",
        firstClass: "i-arrow_first",
        prevClass: "i-arrow_left",
        nextClass: "i-arrow_right",
        lastClass: "i-arrow_last",
        activeClass: "cur",
        initiateStartPageClick: false,
        onPageClick: function () {
            sender.PageChange(sender);
        }
    }

    this.options = $.extend({}, this.defaults, option);
    this.target = $("#" + this.options.target);

    if (this.options.isPagination) {
        //페이징 영역추가
        this.paginate = $("<ul>", {
            "id": this.options.target + "paginate",
            "class": "paginate"
        });
        this.paginate.insertAfter(this.target);

        this.paginateTarget = this.paginate.twbsPagination(this.pagingDef);
    }

    //기본정렬
    this.target.on("click", "thead a", function (e, init) {
        if (!init) {
            var typ = "desc";
            if ($(this).siblings("i").length !== 0 && $(this).siblings("i").hasClass("i-sort-desc"))
                typ = "asc";

            sender.options.sort = { orderCol: $(this).attr("id"), orderTyp: typ.toUpperCase() };
            sender.ajaxGetData();
        }

        $(this).closest("thead").find("i[class^='i-sort']").remove();
        $("<i>", { "class": "i-sort-" + sender.options.sort.orderTyp.toLowerCase() }).insertAfter(this);
    });

    if (this.options.sort) {
        this.options.sort.orderTyp = this.options.sort.orderTyp.toUpperCase();
        this.target.find("thead a[id='" + this.options.sort.orderCol + "']").trigger("click", true);
    }

    //전체 checkbox 선택해제
    this.target.on("click", "thead input[name='chk_all']", function (e, init) {
        sender.target.find("input[type='checkbox']").prop("checked", this.checked);
    });

    //checkbox 컨트롤 개별 선택 해제 시 전체 checkbox 선택해제
    this.target.on("change", "tbody input[type='checkbox']", function (e, init) {
        var checked = $(this).prop('checked'); 
        if (!checked) {
            sender.target.find("input[name='chk_all']").prop("checked", false);
        }
        else {
            var all = sender.target.find("tbody input[type='checkbox']").length;
            var cnt = sender.target.find("tbody input[type='checkbox']:checked").length;
            if (cnt == all) {
                sender.target.find("input[name='chk_all']").prop("checked", true);
            }
        }
    });

    //thead checbox css 추가
    this.target.find("thead label[name='chk_all']").append($("<i>"));

    this.target.find("tbody").append($("<tr>", { "class": "n_bg" }).append(
        $("<td>", { "colspan": option.bindColumn.length }).append(
            $("<div>", { "class": "nolist" }).append(
                $("<div>", { "class": "icon_nolist" })
            )
        )
    ));

    if (this.options.view.url) {
        this.target.on("click", "tbody tr:not(.n_bg)", function(e) {
            if ((e.target.previousSibling && (e.target.previousSibling.type == "checkbox" || e.target.previousSibling.type == "radio")) || e.target.type == "checkbox" || e.target.type == "radio") {
                return;
            }
            const url = sender.options.view.url + "?" + $.param($(this).data());
            if (sender.options.view.isPopup) {
                popupShow({
                    popupName : sender.options.view.popupName,
                    TitleNm : sender.options.view.popupTitle,
                    url: url,
                    iwidth: "auto"
                });
            }
            else {
                if(!sender.options.view.renderBody) {
                    sender.options.view.renderBody = "#renderBody";
                }
                fnRedirect(url, sender.options.view.renderBody);
            }
        });
    }
}
ListSet.prototype = {
    getData: function (isExcel, func, init) {
        var method = { nowPage: 0, pageCnt: this.options.pageCnt }
        if (!isExcel && this.options.isPagination) {
            method = { nowPage: init ? this.options.NowPage : this.GetCurPage(), pageCnt: this.options.pageCnt }
        }

        if (this.options.search) {
            method.searchGubun = this.options.search.Gubun;
            method.searchText = this.options.search.Text;
        }
        method.isExcel = isExcel;

        var parm = $.extend({}, this.options.ajaxParm, method, this.options.sort);
        parm[$("#hdnToken").attr("name")] = $("#hdnToken").val();

        if (isExcel) {
            location.href = this.options.ajaxExcelUrl + "?" + $.param(parm);
        }
        else {
            ajaxCall({
                url: this.options.ajaxUrl,
                param: parm,
                func: function (data) {
                    if (func) {
                        func(data);
                    }
                }
            });
        }


    },
    //페이징셋팅
    ajaxGetData: function (init) {
        if (this.options.bindData) {
            var data = {
                pages: Math.ceil(this.options.bindData.length / this.options.pageCnt),
                list: this.GetBindDataFilter()
            };

            if (this.options.isPagination) {
                this.pagingSet(data, init);
            }
            else {
                this.ListBind(data.list);
            }
        }
        else {
            var sender = this;
            this.getData(false, function (data) {
                if (sender.options.isPagination) {
                    sender.pagingSet(data, init);
                }
                else {
                    sender.ListBind(data.list);
                }
            }, init);
        }
    },
    excelExport: function (func) {
        this.getData(true, func);
    },
    //페이징셋팅
    pagingSet: function (data, init) {
        var nowPage = this.GetCurPage();
        if (init) {
            nowPage = this.options.NowPage;
        }
        if (data.pages < nowPage) {
            nowPage = data.pages == 0 ? 1 : data.pages;
            if (data.pages !== 0) {
                this.paginate.twbsPagination("show", 1);
                return;
            }
        }

        if (this.GetTotPage() !== data.pages) {
            this.paginate.twbsPagination("destroy");
            this.paginate.twbsPagination($.extend({}, this.pagingDef, {
                startPage: nowPage,
                totalPages: data.pages == 0 ? 1 : data.pages
            }));
        }
        this.ListBind(data.list);
        //전체 checkbox 해제
        $("thead input[name='chk_all']").prop("checked", false);
    },
    //리스트바인딩
    ListBind: function (data) {
        var sender = this;
        var option = this.options;

        this.target.find("tbody").empty();
        //리스트 바인딩
        if (!data || data.length === 0) {
            this.target.find("tbody").append(
                $("<tr>", { "class": "n_bg" }).append(
                    $("<td>", { "colspan": option.bindColumn.length }).append(
                        $("<div>", { "class": "nolist" }).append(
                            $("<div>", { "class": "icon_nolist" })
                        )
                    )
                )
            );
            return;
        }

        for (var row in data) {
            var bindTr = $("<tr>");
            if (option.recordAttr) {
                for (var i in option.recordAttr) {
                    if (option.recordAttr[i].dbval) {
                        bindTr.attr(option.recordAttr[i].name, $.trim(data[row][option.recordAttr[i].dbval]));
                    }
                    else {
                        bindTr.attr(option.recordAttr[i].name, option.recordAttr[i].fixval);
                    }
                }
            }

            for (var col in option.bindColumn) {
                var val = "";
                if (data[row], option.bindColumn[col].type !== "rownum") {
                    val = this.toValue(data[row], option.bindColumn[col].column);
                }

                if (option.bindColumn[col].valFuc) {
                    val = option.bindColumn[col].valFuc(val, data[row]);
                }
                var $type;
                switch (option.bindColumn[col].type) {
                    //링크
                    case "link":
                        $type = $("<a>", { text: val });
                        break;
                    //체크박스
                    case "checkbox":
                        $type = $("<label>", { "class": "checkbox" }).append([$("<input>", { value: val, type: "checkbox" }), $("<i>")]);
                        $type = $type.find("input");
                        $type.unbind("click");
                        break;
                    //라디오버튼
                    case "radio":
                        $type = $("<label>", { "class": "radio" }).append([$("<input>", { value: val, type: "radio" }), $("<i>")]);
                        break;
                    //순번
                    case "rownum":
                        var pageIndex = 0;
                        if (option.isPagination) {
                            pageIndex = (parseInt(sender.GetCurPage()) - 1) * parseInt(option.pageCnt);
                        }
                        $type = $("<span>", { text: pageIndex + parseInt(row) + 1 });
                        break;
                    default:
                        $type = $("<span>", { text: val });
                        break;
                }

                //어트리뷰트 삽입
                if (option.bindColumn[col].attr) {
                    for (var attr in option.bindColumn[col].attr) {
                        if (option.bindColumn[col].attr[attr].dbval) {
                            $type.attr(option.bindColumn[col].attr[attr].name, data[row][option.bindColumn[col].attr[attr].dbval]);
                        }
                        else {
                            $type.attr(option.bindColumn[col].attr[attr].name, option.bindColumn[col].attr[attr].fixval);
                        }
                    }
                }

                var bindTd = $("<td>", { "data-title": val });
                if (option.bindColumn[col].cellAttr) {
                    for (var attr in option.bindColumn[col].cellAttr) {
                        if (option.bindColumn[col].cellAttr[attr].dbval) {
                            bindTd.attr(option.bindColumn[col].cellAttr[attr].name, data[row][option.bindColumn[col].cellAttr[attr].dbval]);
                        }
                        else {
                            bindTd.attr(option.bindColumn[col].cellAttr[attr].name, option.bindColumn[col].cellAttr[attr].fixval);
                        }
                    }
                }

                //정렬
                if (option.bindColumn[col].align) {
                    bindTd.css("text-align", option.bindColumn[col].align);
                }

                if (option.bindColumn[col].type === "checkbox") {
                    bindTd.append($type.parent());
                }
                else {
                    bindTd.append($type);
                }

                bindTr.append(bindTd);
            }

            for(var i in option.columnKey) {
                bindTr.data(option.columnKey[i], data[row][option.columnKey[i]]);
            }

            sender.target.find("tbody").append(bindTr);
        }
    },
    /**
     * BindData필터
     */
    GetBindDataFilter: function (init) {
        var data = this.options.bindData;
        var sender = this;
        //검색
        if (this.options.search && this.options.search.Text !== "") {
            data = data.FindArray(this.options.search.Gubun, this.options.search.Text);
        }

        //정렬
        if (this.options.sort) {
            switch (this.options.sort.orderTyp.toLowerCase()) {
                case "desc":
                    //내림차순
                    data.sort(function (a, b) {
                        var x = a[sender.options.sort.orderCol];
                        var y = b[sender.options.sort.orderCol];
                        var valFuc = sender.options.bindColumn.FindArray("column", sender.options.sort.orderCol)[0].valFuc;
                        if (valFuc ) {
                            x = valFuc(x);
                            y = valFuc(y);
                        }
                        return x > y ? -1 : x < y ? 1 : 0;
                    });
                    break;
                case "asc":
                    data.sort(function (a, b) {
                        var x = a[sender.options.sort.orderCol];
                        var y = b[sender.options.sort.orderCol];
                        var valFuc = sender.options.bindColumn.FindArray("column", sender.options.sort.orderCol)[0].valFuc;
                        if (valFuc) {
                            x = valFuc(x);
                            y = valFuc(y);
                        }
                        return x < y ? -1 : x > y ? 1 : 0;
                    });
                    break;
            }
        }

        //페이징
        if (this.options.isPagination) {
            var nowpage = init ? this.options.NowPage : parseInt(this.GetCurPage());
            var startIndex = (nowpage - 1) * this.options.pageCnt;
            var endIndex = nowpage * this.options.pageCnt;

            data = data.filter(function (value, index) {
                return index >= startIndex && index < endIndex;
            });
        }

        return data;
    },
    //현재페이지
    GetCurPage: function () {
        return this.paginate.twbsPagination("getCurrentPage");
    },
    //전체페이지
    GetTotPage: function () {
        return this.paginate.twbsPagination("getTotalPages");
    },
    PageChange: function (listTarget) {
        listTarget.ajaxGetData();
    },
    toValue: function (row, column) {
        var datePattern = /Date\(([^)]+)\)/;
        var Result;
        if (row[column] === null) {
            Result = "";
        }
        else if (typeof row[column] === "object") {
            Result = row[column]["Text"];
        }
        else if (datePattern.exec(row[column]) !== null) {
            Result = new Date(parseFloat(datePattern.exec(row[column])[1])).format("yyyy-MM-dd (ddd) HH:mm:ss", this.options.lang);
        }
        else if (typeof row[column] === "number") {
            Result = row[column].format(0, false, "");
        }
        else if(!isNaN(new Date(row[column]))) {
            Result = new Date(row[column]).format("yyyy-MM-dd (ddd) HH:mm:ss", this.options.lang);
        }
        else {
            Result = row[column];
        }

        return Result;
    },
    setSearch: function (gubun, text) {
        this.options.search.Gubun = gubun;
        this.options.search.Text = text;
        this.ajaxGetData();
    },
    refresh: function (option) {
        this.options = $.extend({}, this.options, option);
        this.ajaxGetData();
    },
    getParam: function () {
        var result = "pageCnt=" + this.options.pageCnt + "&nowPage=" + this.GetCurPage();
        if (this.options.ajaxParm) {
            result += "&" + $.param(this.options.ajaxParm);
        }
        if (this.options.sort) {
            result += "&orderCol=" + this.options.sort.orderCol + "&orderTyp=" + this.options.sort.orderTyp;
        }
        return result;
    }
}

/**
 * 리스트
 * @param {any} option target,ajaxUrl,bindColumn 필수
 */
function listSet(option) {
    var data = new ListSet(option);
    if (data.options.isLoad) {
        data.ajaxGetData(true);
    }
    return data;
}