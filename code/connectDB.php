<?php
header("Content-Type: text/html;charset=utf-8");


function connectDB(){
	$mysql = new mysqli('127.0.0.1','root','070832', 'srtp', 3306);
	mysqli_query($mysql, "SET NAMES UTF8");
	return $mysql;
}

?>