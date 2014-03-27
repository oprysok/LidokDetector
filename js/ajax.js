function ajax($url, $object, $that){
    if (XMLHttpRequest)
	{
        var $class = new XMLHttpRequest();
    }
	else
	{
        var $class = new ActiveXObject("MSXML2.XMLHTTP.3.0");
    }
    $class.open("GET", $url, true);
    $class.onreadystatechange = function()
	{            
		if ($class.readyState == 4 && $class.status == 200) 
		{            
			if ($class.responseXML)
			{            
				$obj = $class.responseText;
				$object($obj,$that);
			}
		}
    }
        $class.send(null);
}