<?php
	header("Content-Type: text/html;charset=utf-8");
	session_start();

	$user = array();
	$weibo = array();


	$topic = $_GET['topic'];
	$time_start = substr($_GET['time_start'],0,13);
	$time_end = substr($_GET['time_end'],0,13);

	// $topic = "美国队长3";
	// $time_start = substr("2016-05-10 14:53",0,13);
	// $time_end = substr("2016-05-10 17:53",0,13);

	$time_start = str_replace(" ", "-", $time_start);
	$time_end = str_replace(" ", "-", $time_end);

	//echo $time_start;
	//echo $time_end;

	set_time_limit(0); //无限请求超时时间

	$mysql = new mysqli('127.0.0.1','root','070832', 'srtp', 3306);
	mysqli_query($mysql, "SET NAMES UTF8");


	$results = mysqli_query($mysql, "SELECT * FROM weibo where topic='$topic' && time >= '$time_start' && time <= '$time_end' ");
	while($row = mysqli_fetch_array($results)){
		array_push($user, $row['person']);
		array_push($weibo, $row['content']);
	}

	//print_r($user);
	//print_r($weibo);

	$cws = scws_open();

	scws_close($cws);


?>

<!DOCTYPE html>
<html>
<head>
	<title>微博内容</title>
	<style type="text/css">
	#weibo
	{
		font-size: 13px
	}
	#usr
	{
		font-size: 14px
	}
	</style>
</head>
<body>
	<?php 
	for($i=0; $i<sizeof($user); $i++)
		echo "<div id='usr'><b>".$user[$i]."</b></div>"."<div id='weibo'>".$weibo[$i]."</div>"."<br>";
	?>
</body>
</html>