$.fn.serializeObject = function () {
    var obj = null;
    try {
        if (this[0].tagName && this[0].tagName.toUpperCase() == "FORM") {
            if (this.find("input[type='file']").length > 0) {
                obj = new FormData();
                this.find("input[type='file']").each(function() {
                    obj.append("file", this.files[0]);
                });
                var arr = this.serializeArray();
                if (arr) {
                    $.each(arr, function () {
                        obj.append(this.name, this.value);
                    });
                }

                $(this).find("input[type='checkbox']").each(function () {
                    obj[$(this).attr("name")] = $(this).prop("checked");
                });
                this.find("span[name],div[name]").each(function () {
                    obj.append($(this).attr("name"), $(this).text());
                });
            }
            else {
                var arr = this.serializeArray();
                if (arr) {
                    obj = {};
                    $.each(arr, function () {
                        obj[this.name] = this.value;
                    });
                }

                $.each(obj, function (name) {
                    let sender = $("[name='" + name + "']");
                    if (sender.data("number")) {
                        obj[name] = sender.autoNumericGet();
                    }
                });

                $(this).find("input[type='checkbox']").each(function () {
                    obj[$(this).attr("name")] = $(this).prop("checked");
                });

                $(this).find("span[name],div[name]").each(function () {
                    obj[$(this).attr("name")] = $(this).text();
                });
            }
        }
    } catch (e) {
        alert(e.message);
    } finally {
    }

    return obj;
};
$.inBool = function (strFind, arr) {
    return $.inArray(strFind, arr) > -1;
};
Object.defineProperty(String.prototype, "dateParser", {
    value: function () {
        if ($.inBool(this.toString(), ["00000000", "", "1899-12-30", "1899.12.30", "18991230"])) {
            return NaN;
        }
        else if (!isNaN(new Date(this))) {
            return new Date(this);
        }
        else if (/^(\d){8}$/.test(this)) {
            var y = this.substr(0, 4);
            var m = this.substr(4, 2) - 1;
            var d = this.substr(6, 2);
            return new Date(y, m, d);
        }
        else if (/Date\(([^)]+)\)/.exec(this) !== null) {
            return new Date(parseFloat(/Date\(([^)]+)\)/.exec(this)[1]));
        }
        else {
            return NaN;
        }
    }
});

Object.defineProperty(String.prototype, "timeParser", {
    value: function () {
        if (this.toString() == "") {
            return NaN;
        }
        else if (/^(\d){4}$/.test(this)) {
            var h = this.substr(0, 2);
            var m = this.substr(2, 2);
            var s = 0;
            var date = new Date(0, 0, 0, h, m, s);
            return date;
        }
        else if (/^(\d){6}$/.test(this)) {
            var h = this.substr(0, 2);
            var m = this.substr(2, 2);
            var s = this.substr(4, 2);
            var date = new Date(0, 0, 0, h, m, s);
            return date;
        }
        else if (/^\d{2}:\d{2}:\d{2}$/.test(this)) {
            var h = this.substr(0, 2);
            var m = this.substr(3, 2);
            var s = this.substr(6, 2);
            var date = new Date(0, 0, 0, h, m, s);
            return date;
        }
        else if (/^\d{2}:\d{2}$/.test(this)) {
            var h = this.substr(0, 2);
            var m = this.substr(3, 2);
            var date = new Date(0, 0, 0, h, m, 0);
            return date;
        }
        else {
            return NaN;
        }
    }
});

Object.defineProperty(String.prototype, "PadLeft", {
    value: function (totalWidth, paddingChar) {
        return PadHelp(this, totalWidth, paddingChar, false);
    }
});
Object.defineProperty(String.prototype, "PadRight", {
    value: function (totalWidth, paddingChar) {
        return PadHelp(this, totalWidth, paddingChar, true);
    }
});
Object.defineProperty(String.prototype, "toCamelCase", {
    value: function () {
        return this.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    }
});

function PadHelp(num, totalWidth, paddingChar, isRightPadded) {
    var s = num + "";
    if (isRightPadded) while (s.length < totalWidth) s = s + paddingChar;
    else while (s.length < totalWidth) s = paddingChar + s;
    return s;
}

Object.defineProperty(Number.prototype, "format", {
    value: function (digits, comma, sign, math, rdec) {
        var result;
        var tDigits = 0;
        tDigits = parseInt(digits);
        if (tDigits !== 0) {
            tDigits = Math.pow(10, tDigits);
        }
        math = fnStrNull(math, "S");
        if (math === "S") {
            if (tDigits !== 0) {
                result = Math.round(this * tDigits) / tDigits;
            }
            else {
                result = Math.round(this);
            }
        }
        else if (math === "F") {
            if (tDigits !== 0) {
                result = Math.floor(this * tDigits) / tDigits;
            }
            else {
                result = Math.floor(this);
            }
        }
        else if (math === "C") {
            if (tDigits !== 0) {
                result = Math.ceil(this * tDigits) / tDigits;
            }
            else {
                result = Math.ceil(this);
            }
        }
        result = result.toLocaleString(undefined, { useGrouping: !comma, minimumFractionDigits: digits });
        if (rdec && result.indexOf(".") > -1) {
            result = result.replace(/(0+$)/, "");
            if (result.split('.')[1] == "") {
                result = result.replace(".", "");
            }
        }

        return sign + result.toLocaleString(undefined, { useGrouping: !comma, minimumFractionDigits: digits });
    }
});

Object.defineProperty(Date.prototype, "format", {
    value: function (f, lang) {
        if (isNaN(this)) {
            return "";
        }
        lang = lang ? lang : "ko";
        var locale = {
            ko: {
                dayName: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
                dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
                monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
                meridiemParse: ["오전", "오후"],
                dateFormat: "yyyy년 MM월 dd일",
                monthFormat: "MM월 dd일",
                yearFormat: "MM월 dd일",
                fullFormat: "yyyy년 MMM월 dd일 tt h:mm"
            },
            en: {
                dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                meridiemParse: ["AM", "PM"],
                dateFormat: "MMM dd, yyyy",
                monthFormat: "MMM dd",
                yearFormat: "MMM yyyy",
                fullFormat: "MMM dd, yyyy h:mm tt"
            }
        };

        var thisLoc = locale[lang];
        switch (f) {
            case "D": f = thisLoc.dateFormat; break;
            case "M": f = thisLoc.monthFormat; break;
            case "Y": f = thisLoc.yearFormat; break;
            case "f": f = thisLoc.fullFormat; break;
        }

        var d = this;
        return f.replace(/(yyyy|yy|MMM|MM|dddd|ddd|dd|hh|h|mm|ss|tt)/gi, function ($1) {
            switch ($1) {
                case "yyyy": return d.getFullYear();
                case "yy": return String(d.getFullYear() % 1000).PadLeft(2, "0");
                case "MMM": return thisLoc.monthsShort[(d.getMonth() + 1)];
                case "MM": return String(d.getMonth() + 1).PadLeft(2, "0");
                case "dd": return String(d.getDate()).PadLeft(2, "0");
                case "ddd": return thisLoc.dayNamesShort[d.getDay()];
                case "dddd": return thisLoc.dayName[d.getDay()];
                case "HH": return String(d.getHours()).PadLeft(2, "0");
                case "hh": return String((h = d.getHours() % 12) ? h : 12).PadLeft(2, "0");
                case "h": return (h = d.getHours() % 12) ? h : 12;
                case "mm": return String(d.getMinutes()).PadLeft(2, "0");
                case "ss": return String(d.getSeconds()).PadLeft(2, "0");
                case "tt": return d.getHours() < 12 ? thisLoc.meridiemParse[0] : thisLoc.meridiemParse[1];
                default: return $1;
            }
        });
    }
});

Object.defineProperty(Date.prototype, "termAdd", {
    value: function (termType, termDate) {
        var date = this;
        switch (termType) {
            case "year":
                date.setFullYear(date.getFullYear() + termDate);
                date.setDate(date.getDate() - 1);
                break;
            case "month":
                date.setMonth(date.getMonth() + termDate);
                date.setDate(date.getDate() - 1);
                break;
            case "day":
                date.setDate(date.getDate() + termDate - 1);
                break;
        }
        return date;
    }
});

Object.defineProperty(Array.prototype, "FindArray", {
    value:
        function (findKey, findValue) {
            let result = this.FindArrayAll(findKey, findValue);
            return result[0];
        }
});
Object.defineProperty(Array.prototype, "FindArrayAll", {
    value:
        function (findKey, findValue) {
            let result = this.filter(function (x) {
                var result = true;
                if (Array.isArray(findKey)) {
                    for (var arr in findKey) {
                        if (x[findKey[arr]] != findValue[arr])
                            return false;
                    }
                }
                else {
                    result = x[findKey] == findValue;
                }

                return result;
            });

            return result;
        }
});

Object.defineProperty(Array.prototype, "FindRemove", {
    value:
        function (findKey, findValue) {
            var t = this.FindArray(findKey, findValue);
            for (var i in t) {
                var idx = this.indexOf(t[i]);
                if (idx > -1) {
                    this.splice(idx, 1);
                }
            }
        }
});

function termdiff(start, end, termType) {
    if (typeof start === "string") {
        start = start.dateParser();
    }
    if (typeof end === "string") {
        end = end.dateParser();
    }

    if (start == null || end == null || isNaN(start) || isNaN(end)) {
        return "";
    }

    var result = "";
    if (termType) {
        result = termdiffMath(start, end, termType).toFixed(2) + termdiffString(termType);
    }
    else {
        let arrTermType = ["seconds", "minute", "hour", "day", "month", "year"];
        termType = 0;
        while(parseInt(termdiffMath(start, end, arrTermType[termType + 1])) > 0) {
            termType++;
        }
        result = termdiffMath(start, end, arrTermType[termType]).toFixed(2) + termdiffString(arrTermType[termType]);
    }

    return result;
}

function termdiffMath(start, end, termType) {
    let result = 0;
    switch (termType) {
        case "year":
            result = (end.getTime() - start.getTime()) / (1000*60*60*24*30*12);
            break;
        case "month":
            result = (end.getTime() - start.getTime()) / (1000*60*60*24*30);
            break;
        case "day":
            result = (end.getTime() - start.getTime()) / (1000*60*60*24);
            break;
        case "hour":
            result = (end.getTime() - start.getTime()) / (1000*60*60);
            break;
        case "minute":
            result = (end.getTime() - start.getTime()) / (1000*60);
            break;
        case "seconds":
            result = (end.getTime() - start.getTime()) / 1000;
            break;
    }
    return result;
}

function termdiffString(termType) {
    let result = "";
    switch (termType) {
        case "year": result = "y"; break;
        case "month": result = "M"; break;
        case "day": result = "d"; break;
        case "hour": result = "h"; break;
        case "minute": result = "m"; break;
        case "seconds": result = "s"; break;
    }
    return result;
}

Object.defineProperty(Date.prototype, "getTotalSeconds", {
    value: function () {
        var date = new Date(0, 0, 0);
        return (this - date) / 1000;
    }
});

let isIE = function () {
    var agent = navigator.userAgent.toLowerCase();
    return (navigator.appName == "Netscape" && agent.indexOf("trident") != -1) || (agent.indexOf("msie") != -1)
};

function ajaxCall(option) {
    var defaults = {
        url: null,
        param: null,
        async: true,
        type: "post",
        processData: true,
        isloading: true,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        func: null,
        token: null,
        traditional: true,
        isExcel: false,
    };

    const options = $.extend({}, defaults, option);

    const result = {
        resultCode: "S",
        errMsg: null
    }
    if (options.isloading) {
        fnSetLoading("ajaxLoading");
    }
    $.ajax({
        type: options.type, data: options.param, url: options.url, traditional: options.traditional, datatype: "json", processData: options.processData, async: options.async, contentType: options.contentType,
        xhrFields: {
            responseType: options.isExcel ? "blob" : "text",
        },
        beforeSend : function(xhr) {
            if (options.token) {
                xhr.setRequestHeader(options.token.tokenName, options.token.tokenValue);
            }
        },
        success: function (data, status, xhr) {
			if (!options.isExcel) {
				value = data;
	            if (options.func) {
	                options.func(data);
	            }
			}
			else {
				var fileName = "";
		        var disposition = xhr.getResponseHeader("Content-Disposition");
		
		        if (disposition && disposition.indexOf("attachment") !== -1) {
		            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
		            var matches = filenameRegex.exec(disposition);
		
		            if (matches != null && matches[1]) {
		                fileName = decodeURI(matches[1].replace(/['"]/g, ""));
		            }
		        }
		
	            var URL = window.URL || window.webkitURL;
	            var downloadUrl = URL.createObjectURL(data);
	
	            if (fileName) {
	                var a = document.createElement("a");
	
	                // for safari
	                if (a.download === undefined) {
	                    window.location.href = downloadUrl;
	                } else {
	                    a.href = downloadUrl;
	                    a.download = fileName;
	                    document.body.appendChild(a);
	                    a.click();
	                }
	            } else {
	                window.location.href = downloadUrl;
	            }
	            URL.revokeObjectURL(downloadUrl);
	        }
        },
        error: function (e) {
            if (e.status === 401) {
                location.href = "/Login";
                return;
            }
            result.resultCode = "E";
            result.errMsg = decodeURIComponent(e.statusText);
            if (options.func) {
                options.func(result);
            }
        },
        complete: function () {
            if (options.isloading) {
                $("#ajaxLoading").remove();
            }
        }
    });

    return result;
}

function htmlEncode(value) {
    return $("<div>").text(value).html();
}

function htmlDecode(value) {
    return $("<div>").html(value).text();
}

function fnStrNull(value, def) {
    if (value === undefined || value === null || value === "") {
        return def;
    }
    else {
        return value;
    }
}

function getArea() {
    return window.location.href.replace(window.location.protocol + "//" + window.location.host + "/", "");
}

function fnRedirect(url, dom, func) {
    var pushData = {
        area: getArea(),
        module: $("#menuList .focus a").attr("id"),
        left: $(".sidemenu .jstree-wholerow-clicked").parent().attr("id"),
        url: url,
        dom: dom
    };

    $(dom).empty();
    var highestIntervalId = setInterval(";");
    for (var i = 0 ; i < highestIntervalId ; i++) {
        clearInterval(i);
    }
    window.history.pushState(pushData, "url", window.location.href);
    fnSetLoading("defLoading");

    if (dom) {
        $(dom).load(url, function (responseText, textStatus, req) {
            if (req.status === 401) {
                location.href = "/Login";
                return;
            }
            setTimeout(function () {
                $("#defLoading").remove();
                if (func) {
                    func();
                }
            }, 100);
        });
    }
    else {
        $("body").load(url, function (responseText, textStatus, req) {
            if (req.status === 401) {
                location.href = "/Login";
                return;
            }
            setTimeout(function () {
                $("#defLoading").remove();
                if (func) {
                    func();
                }
            }, 100);
        });
    }
}

$(window).on("popstate", function (event) {
    if (event.originalEvent.state) {
        fnSetLoading("history");
        if (getArea() !== event.originalEvent.state.area) {
            $(event.originalEvent.state.dom).load(event.originalEvent.state.url, function () {
                $("#history").remove();
            });
        }
        else if ($("#menuList .focus a").attr("id") !== event.originalEvent.state.module) {
            $("#menuList li").removeClass("focus");
            var sender = $("#menuList .focus a #" + event.originalEvent.state.module);
            sender.parent().addClass("focus");
            $("#content").load(sender.data("url"), function () {
                $(".sidemenu .jstree-node").removeClass("jstree-wholerow-clicked");
                $(".sidemenu #" + event.originalEvent.state.left + ">div").addClass("jstree-wholerow-clicked");

                $("#renderBody").load(event.originalEvent.state.url, function () {
                    $("#history").remove();
                });
            });
        }
        else if ($(".sidemenu .jstree-wholerow-clicked").parent().attr("id") !== event.originalEvent.state.left) {
            $("#renderBody").load(event.originalEvent.state.url, function () {
                $("#history").remove();
            });
        }

        $("iframe").each(function () {
            popupClose($(this).attr("id"));
        });
    }
});

function fnSetLoading(id) {
    if ($("#" + id).length == 0) {
        var root = $("<div>", { "id": id, "class": "loading-container" });
        root.append([
            $("<div>", { "class": "loading" }),
            $("<div>", { "class": "loading_text", "text": "LOADING" })
        ]);
        $("body").append(root);
    }
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, option) {
    var defaults = {
        path: '/',
        options: {}
    };

    const options = $.extend({}, defaults, option);

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = name + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", { 'max-age': -1 });
}

function toastShow(msg) {
    toastr.options = {
        "progressBar": true,
        "closeButton": true,
        "positionClass": "toast-top-center",
        "timeOut": "2000"
    }
    toastr.info(msg);
}

function popupShow(option) {
    this.defaults = {
        popupName: "",
        TitleNm: "",
        url: "",
        iwidth: 0,
        iheight: "auto",
        isFullscreen: false,
        isIframe: false,
        isHideTitle: false,
        isScroll: false,
        param: null,
        closefn: null,
        isAutoClose: false
    };

    this.options = $.extend({}, this.defaults, option);
    if ($(window).height() < this.options.iheight) {
        this.options.iheight = $(window).height();
    }
    else if (this.options.iheight === "auto") {
        this.options.maxHeight = "calc(100vh - 50px)";
    }

    let $dialog = $("<div>", {
        "id": this.options.popupName
    });
    if (!this.options.isIframe) {
        if (this.options.isScroll || this.options.iheight === "auto") {
            $dialog.css("overflow", "auto");
        }

        if (!this.options.param) {
            $dialog.load(this.options.url, function (responseText, textStatus, req) {
                if (req.status === 401) {
                    location.href = "/Login";
                    return;
                }
                $(this).dialog("open");
                $("#popLoading").remove();
            });
        }
        else {
            $dialog.load(this.options.url, this.options.param, function (responseText, textStatus, req) {
                if (req.status === 401) {
                    location.href = "/Login";
                    return;
                }
                $(this).dialog("open");
                $("#popLoading").remove();
            });
        }
    }
    else {
        $dialog.css("padding", "0");
        var ifr = $("<iframe>", {
            "id": "ifr" + this.options.popupName,
            "name": "ifr" + this.options.popupName,
            "frameborder": "0",
            "style": "width: 100%; height: 100%;",
            "src": this.options.url
        });
        if (this.options.isScroll || this.options.iheight === "auto") {
            ifr.attr("scrolling", "auto");
        }
        ifr.on("load", function () {
            $dialog.dialog("open");
            $("#popLoading").remove();
        });
        $dialog.append(ifr);
    }

    fnSetLoading("popLoading");
    const sender = this;
    $dialog.dialog({
        autoOpen: false,
        modal: true,
        height: this.options.iheight,
        maxHeight: this.options.maxHeight,
        width: this.options.iwidth,
        title: this.options.TitleNm,
        resizable: false,
        closeText: "",
        classes: {
            "ui-icon-closethick": "i-cancel"
        },
        show: { effect: "fade" },
        hide: { effect: "fade" },
        beforeClose: function () {
            if (sender.options.closefn) {
                sender.options.closefn();
            }
        },
        close: function (event, ui) {
            $(event.target).dialog("destroy");
            $(event.target).remove();
        },
        open: function () {
            $(this).parent().find(".ui-dialog-titlebar .ui-icon-closethick").addClass("i-cancel");
            if (sender.options.isAutoClose) {
                $(".ui-widget-overlay.ui-front").one("mousedown", function() {
                    $dialog.dialog("close");
                });
            }
        }
    });

    if (!this.options.isHideTitle) {
        $("#" + this.options.popupName).siblings(".ui-dialog-titlebar").show();
    }
    else {
        $("#" + this.options.popupName).siblings(".ui-dialog-titlebar").hide();
    }

    if (this.options.isFullscreen) {
        $("#" + this.options.popupName).parent().addClass("dialog-fullscreen");
    }


}

function popupClose(popupName) {
    $("#" + popupName + ".ui-dialog-content").dialog("close");
}

function popupResize(popupName) {
    var height = $("#" + popupName).dialog("option", "height");
    var width = $("#" + popupName).dialog("option", "width");
    $("#" + popupName).dialog("option", { "width": width, "height": height });
}

function datepickerLang(langType) {
    switch (langType) {
        case "cn": langType = "zh-cn"; break;
        case "jp": langType = "ja"; break;
    }

    return langType;
}

function getArrayParam(result, arr, paramName) {
    for (let index = 0; index < arr.length; index++) {
        for(let column in arr[index]) {
            result[`${paramName}[${index}].${column}`] = arr[index][column];
        }
    }
}

$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    $(document).on("change", ".filebox input[type='file']", function() {
        let filename = "";
        if($(this).val() !== "") {
            if(window.FileReader){
                filename = this.files[0].name;
            }
            else {
                filename = $(this).val().split('/').pop().split('\\').pop();
            }
        }

        $(this).siblings(".upload_name").val(filename);
    });
});