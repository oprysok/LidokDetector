/*global XMLHttpRequest:true, ActiveXObject:true, console*/
function ajax($url, $object, $that) {
    "use strict";
    var $class, $obj;
    if (XMLHttpRequest) {
        $class = new XMLHttpRequest();
    } else {
        $class = new ActiveXObject("MSXML2.XMLHTTP.3.0");
    }
    $class.open("GET", $url, true);
    $class.onreadystatechange = function () {
        if ($class.readyState === 4 && $class.status === 200) {
            if ($class.responseXML) {
                $obj = $class.responseText;
                $object($obj, $that);
            }
        }
    };
    $class.send(null);
}