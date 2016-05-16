<?php
header("Content-Type: text/html;charset=utf-8");

session_start();

if (isset($_SESSION['user'])){
	
    set_time_limit(0);

	$k = $_SESSION['k'];
	$times = $_SESSION['times'];
	$all = $_SESSION['all'];

	$data = $all[$k];
	$time = $times[$k];
	
	$token_data = array("data"=>$data, "time"=>$time);
	$token_data_json = json_encode($token_data);
	
	echo $token_data_json;

	$_SESSION['k']++;

}
else{
        
}

?>

