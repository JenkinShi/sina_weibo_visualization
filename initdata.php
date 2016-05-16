<?php
header("Content-Type: text/html;charset=utf-8");
include('connectDB.php');

session_start();
$_SESSION['user'] = 'root';

$mysql = connectDB();

$results = mysqli_query($mysql, "SELECT * FROM films ");

$all = array();
$topic = array();
$beginTopic = array();
$num = array();
$times = array();

while($row = mysqli_fetch_array($results)){
	$stamp = $row['stamp'];
	$timeid = $row['timeid'];
	$rank = $row['rank'];
	$t = $row['topic'];
	$n = $row['num'];
	if($rank==1){
		array_push($times, substr($stamp,0,16));
	}

	if($timeid%20==0){
		if($rank<=10){
			array_push($topic, $t);
			array_push($num, $n);
			if($rank==10){
				$obj = array("$topic[0]" => $num[0], "$topic[1]" => $num[1], "$topic[2]" => $num[2], "$topic[3]" => $num[3], "$topic[4]" => $num[4], "$topic[5]" => $num[5],"$topic[6]" => $num[6], "$topic[7]" => $num[7], "$topic[8]" => $num[8], "$topic[9]" => $num[9]);
				array_push($all, $obj);
				$beginTopic = $topic;
				$topic = array();
				$num = array();
			}
		}
	}
    else{
    	if(sizeof($topic)<10){
    		if(in_array($t, $beginTopic)){
	    		array_push($topic, $t);
	    		array_push($num, $n);
    		}
    		if($rank==50 && sizeof($topic)<10){
    			foreach($beginTopic as $tt){
					if(!in_array($tt, $topic)){
						array_push($topic, $tt);
	    				array_push($num, 10000);
					}
				}
    		}
    		if(sizeof($topic)==10){
    			$obj = array("$topic[0]" => $num[0], "$topic[1]" => $num[1], "$topic[2]" => $num[2], "$topic[3]" => $num[3], "$topic[4]" => $num[4], "$topic[5]" => $num[5],"$topic[6]" => $num[6], "$topic[7]" => $num[7], "$topic[8]" => $num[8], "$topic[9]" => $num[9]);
				//print_r($obj);
				array_push($all, $obj);
				
    		}
    		
    	}
    	if($rank==50) {

    		$topic = array();
			$num = array();
			if($timeid%20==19){
	    		$beginTopic = array();
	    	}
    	}
    	
    }
}


$k = 0;
$i = 0;
$river_data = array();

for($i=0; $i<12; $i++){
	$arr = array();
	for($j=0; $j<21; $j++){
		array_push($arr, $all[$k+$i*20+$j]);
	}
	array_push($river_data, $arr);
}


$archive_data = array();
for($i=0; $i<6; $i++){
	$sum = array();
	foreach($river_data[$i][0] as $t=>$n){
		$sum["$t"] = $n;
	}
	for($j=1; $j<20; $j++){
		foreach($river_data[$i][$j] as $t=>$n){
			$sum["$t"] += $n;
		}
	}
	array_push($archive_data, $sum);
	
}

$river_data = array_splice($river_data,6,6);


$archive_time = array();
for($i=0; $i<6; $i++){
	array_push($archive_time, $times[$i*20]);
}


$river_time = array();
$i=20*6;
for($i=6; $i<12; $i++){
	$rivertime = array();
	for($j=0; $j<21; $j++){
		array_push($rivertime, $times[$i*20+$j]);
	}
	array_push($river_time, $rivertime);
}


$data = array("archive_data"=>$archive_data, "river_data"=>$river_data, "archive_time"=>$archive_time, "river_time"=>$river_time);

$data_json = json_encode($data);

echo $data_json;


mysqli_close($mysql);

$_SESSION['k'] = 241;
$_SESSION['times'] = $times;
$_SESSION['all'] = $all;

?>