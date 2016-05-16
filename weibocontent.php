<?php
header("Content-Type: text/html;charset=utf-8");
include('connectDB.php');

session_start();

if (isset($_SESSION['user'])){

	set_time_limit(0);
	
	$user = array();
	$weibo = array();


	$topic = $_GET['topic'];
	$time_start = substr($_GET['time_start'],0,13);
	$time_end = substr($_GET['time_end'],0,13);


	$time_start = str_replace(" ", "-", $time_start);
	$time_end = str_replace(" ", "-", $time_end);

	$mysql = connectDB();

	$results = mysqli_query($mysql, "SELECT * FROM weibo where topic='$topic' && time >= '$time_start' && time <= '$time_end' ");
	while($row = mysqli_fetch_array($results)){
		array_push($user, $row['person']);
		array_push($weibo, $row['content']);
	}

	mysqli_close($mysql);
}
else{
        
}

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