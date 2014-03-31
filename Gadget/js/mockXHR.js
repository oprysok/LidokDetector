/*
    Copyright (c) 2014 Mykhaylo Oprysok
    mockXHR.js
    2014-03-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.

    This file creates a global MockXHR object containing one method - mock.

        MockXHR.mock({ url, status, responseText })
            url             string which represents the rule with wildcards '?' 
                            (for one character) and '*' (for many characters). 
                            '?' and '*' can be escaped with '\?' and '\*'.
                            Example: pattern 'test.com/\??=*' 
                            matches 'test.com/?a=123'.
            status          numerical value. When XMLHttpRequest's 'send' is 
                            called this property is set to XMLHttpRequest.status..
            responseText    any JavaScript value, usually an object or array.
                            When XMLHttpRequest's 'send' is called this propery is 
                            coverted to string (if it is an object or array of 
                            objects) and set to XMLHttpRequest.responseText.

            This method reads, validates and saves rules passed as argumens. 
            Afterwards it overrides XMLHttpRequest's 'open' and 'send' methods.
            MockXHR accepts both single object or array of objects. Already existing 
            rules with same url property are overwritten.
            When XMLHttpRequest's 'open' method is invoked MockXHR matches defined rules
            by url passed to this method as second argument. XMLHttpRequest properties 
            updated with matched rule's properties.
            When XMLHttpRequest's 'send' method is invoked 'onreadystatechange' event 
            handler is triggered.

            Example:

            mockXHR.mock({ 
              url:'testurl.com',
              status:200,
              responseText:'{"response":"mocked response text"}'
            });
 */
/*global mockXHR:true, XMLHttpRequest:true, console*/

mockXHR = { rules: [] };

(function () {
    "use strict";

    function match(string, pattern) {
        var regexFromWildcard, patternRegex, escape;
        escape = '/[$-\/?[-^{|}]/g';
        regexFromWildcard = pattern.replace('?', '\\?').replace(escape, '\\$&').replace('\\\\\\?', '.').replace('\\*', '.*');//pattern.replace('/\?/', '\\?').replace(escape, '\\$&').replace('\\\\\\?', '.').replace('\\*', '.*');
        patternRegex = new RegExp(regexFromWildcard);
        if (string.match(patternRegex)) {
            return true;
        }
        return false;
    }

    function validateRule(rule) {
        if (isNaN(rule.status)) {
            throw "Rule validation failed. Property: status.";
        }
    }

    function tryToJSON(input) {
        try {
            var obj = JSON.parse(input);
            return obj;
        } catch (e) {
            return input;
        }
    }

    function writeRule(rule) {
        var overwroteExisting, i;
        validateRule(rule);
        rule.responseText = tryToJSON(rule.responseText);
        overwroteExisting = false;
        i = 0;

        for (i = 0; i < mockXHR.rules.length; i += 1) {
            if (rule.url === mockXHR.rules[i].url) {
                mockXHR.rules[i].status = rule.status;
                mockXHR.rules[i].responseText = rule.responseText;
                overwroteExisting = true;
            }
        }

        if (!overwroteExisting) {
            mockXHR.rules.push(rule);
        }
    }

    function addRules(rules) {
        if (rules !== null && typeof rules === "object") {// object or array
            if (rules.toString() === "[object Object]" && rules.length === undefined) {//object
                writeRule(rules);
            } else {//array
                var i;
                for (i = 0; i < rules.length; i += 1) {
                    writeRule(rules[i]);
                }
            }
        } else {
            throw new TypeError("Expecting array or object");
        }
    }

    mockXHR.mock = function (rules) {
        addRules(rules);
        var OriginalXMLHttpRequest = XMLHttpRequest;
        XMLHttpRequest = function () {
            this.xhr = new OriginalXMLHttpRequest();
            return this;
        };
        XMLHttpRequest.prototype.open = function (method, url) {
            var ruleMatched, i;
            this.requestMethod = method;
            ruleMatched = false;
            for (i = 0; i < rules.length; i += 1) {

                if (match(url, rules[i].url)) {
                    this.status = rules[i].status;
                    this.responseText = JSON.stringify(rules[i].responseText);
                    this.readyState = 4;
                    ruleMatched = true;
                    this.responseXML = true;
                }
            }
            if (!ruleMatched) {
                throw "MockXHR: request to " + url + " was not matched with any of defined rules";
            }
        };

        XMLHttpRequest.prototype.send = function () {
            if (this.onreadystatechange !== null) {
                this.onreadystatechange();
            }
        };
    };
}());