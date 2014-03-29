/*
	Copyright (c) 2014 Mykhaylo Oprysok
    mockXHR.js
    2014-03-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.

    This file creates a global MockXHR object containing one method- mock.

        MockXHR.mock({ url, status, responseText })
            url				string which represents the rule with 
            				wildcards '?' (for one character) 
            				and '*' (for many characters). '?' and '*' 
            				can be escaped with '\?' and '\*'.
            				Example: pattern 'http://test.com/\??=*' 
            				to match 'http://test.com/?a=123'
            status    		numerical value. XMLHttpRequest.send() is called this propery is 
            				set to XMLHttpRequest.status.
            responseText	any JavaScript value, usually an object or array.
            				When XMLHttpRequest.send() is called this propery is 
            				coverted to string (if it is an object or array of objects) 
            				and set to XMLHttpRequest.responseText.

            This method reads, validates and saves rules passed as argumens. 
            Afterwards it overrides XMLHttpRequest's open and send methods.
            MockXHR accepts both single object or array of objects. Already existing rules 
            with same url property are overwritten.
			When XMLHttpRequest's open method is invoked MockXHR matches defined rules
			by url passed to this method as first argument. XMLHttpRequest properties 
			updated with matched rule's properties.
			When XMLHttpRequest's send method is invoked 'onreadystatechange' event handler 
			is triggered.

            Example:

            mockXHR.mock({ 
		  		url:'http://testurl.com/*', 
		 		status:200, 
		 		responseText:'{"response":"mocked response text"}' 
		    });
 */

if (typeof mockXHR) {
	mockXHR = {
		rules:[]
	};
}

(function (){
	'use strict';

	function match(string,pattern)
	{
		var regexFromWildcard = pattern.replace("\?","\\?").replace(/[$-\/?[-^{|}]/g, '\\$&').replace("\\\\\\?",".").replace("\\*",".*");

		var patternRegex = new RegExp(regexFromWildcard);

		if (string.match(patternRegex)) return true;

		return false;
	}

	function validateRule(rule)
	{
		if (isNaN(rule.status)) throw "Rule validation failed. Property: status.";
	}

	function tryToJSON(input)
	{
		try
		{
			var obj = JSON.parse(input);
			return obj;
		} 
		catch(e) 
		{ 
			return input; 
		}
	}

	function writeRule(rule)
	{
		validateRule(rule);

		rule.responseText = tryToJSON(rule.responseText);

		var overwroteExisting = false;

		for (var i = 0; i < mockXHR.rules.length; i++) 
		{
			if (rule.url == mockXHR.rules[i].url)
			{
				mockXHR.rules[i].status = rule.status;
				mockXHR.rules[i].responseText = rule.responseText;
				overwroteExisting = true;				
			}
		}

		if (!overwroteExisting) mockXHR.rules.push(rule);
	}

	function addRules(rules)
	{
		if (rules !== null && typeof rules == "object") {// object or array
			if (rules.toString()=="[object Object]" && rules.length === undefined) {//object
				writeRule(rules);
			}
			else {//array
				for (var i = 0; i < rules.length; i++){
					writeRule(rules[i]);
				}
			}
		}
		else
		{
			throw new TypeError("Expecting array or object");
		}
	}

	mockXHR.mock = function(rules)
	{
		var self = this;
		addRules(rules);
		var originalXMLHttpRequest = XMLHttpRequest;
		XMLHttpRequest = function() {
	    	this.xhr = new originalXMLHttpRequest();
	    	return this;
		};
		XMLHttpRequest.prototype.open = function(method, url, async){

			var ruleMatched = false;

			for (var i = 0; i < rules.length; i++) {

				if (match(url,rules[i].url)){

					this.status = rules[i].status;
					this.responseText = JSON.stringify(rules[i].responseText);
					this.readyState = 4;
					ruleMatched = true;
					this.responseXML = true;
				}
			}
			if (!ruleMatched) {
				console.log("MockXHR: request to " + url + " was not matched with any of defined rules");
			}
		};

		XMLHttpRequest.prototype.send = function() 
		{ 
			if (this.onreadystatechange != null) this.onreadystatechange();
		};
	}
}());

/*

function MockXHR()
{
	this.rules = [];
}

MockXHR.prototype.match = function(string,pattern)
	{
		var regexFromWildcard = pattern.replace("\?","\\?").replace(/[$-\/?[-^{|}]/g, '\\$&').replace("\\\\\\?",".").replace("\\*",".*");

		var patternRegex = new RegExp(regexFromWildcard);

		if (string.match(patternRegex)) return true;

		return false;
	};


MockXHR.prototype.validateRule = function(rule)
{
	if (isNaN(rule.status)) throw "Rule validation failed. Property: status.";
}

MockXHR.prototype.tryToJSON = function(input)
{
	try
	{
		var obj = JSON.parse(input);
		return obj;
	} 
	catch(e) 
	{ 
		console.log("input is not a JSON object : " + e); 
		return input; 
	}
}

MockXHR.prototype.tryToString = function(input)
{
	return JSON.stringify(input);
	try
	{
		var obj = JSON.parse(input);

		return JSON.stringify(obj);
	}
	catch(e) 
	{ 
		console.log("input is not a JSON object : " + e); 
		return input; 
	}
}

MockXHR.prototype.writeRule = function(rule)
{
	this.validateRule(rule);

	rule.responseText = this.tryToJSON(rule.responseText);

	var overwroteExisting = false;

	for (var i = 0; i < this.rules.length; i++) 
	{
		if (rule.url == this.rules[i].url)
		{
				this.rules[i].status = rule.status;
				this.rules[i].responseText = rule.responseText;
				overwroteExisting = true;				
		}
	}

	if (!overwroteExisting) this.rules.push(rule);
}

MockXHR.prototype.addRules = function(rules)
{
	if (rules !== null && typeof rules == "object")
	{// object or array
		if (rules.toString()=="[object Object]" && rules.length === undefined)
		{//object
			this.writeRule(rules);
		}
		else
		{//array
			for (var i = 0; i < rules.length; i++)
			{
				this.writeRule(rules[i]);
			}
		}
	}
	else
	{
		throw new TypeError("Expecting array or object");
	}
}

MockXHR.prototype.mock = function(rules)
{
	var self = this;

	this.addRules(rules);

	var originalXMLHttpRequest = XMLHttpRequest;

	XMLHttpRequest = function() 
	{
    	this.xhr = new originalXMLHttpRequest();
    	return this;
	};

	XMLHttpRequest.prototype.open = function(method, url, async)
	{
		var ruleMatched = false;

		for (var i = 0; i < rules.length; i++) 
		{
			if (self.match(url,rules[i].url))
			{
				this.status = rules[i].status;
				this.responseText = JSON.stringify(rules[i].responseText);
				this.readyState = 4;
				ruleMatched = true;
				this.responseXML = true;
			}
		}

		if (!ruleMatched)
		{
			console.log("MockXHR: request to " + url + " was not matched with any of defined rules");
		}
	};

	XMLHttpRequest.prototype.send = function() 
	{ 
		if (this.onreadystatechange != null) this.onreadystatechange();
	};

};
*/