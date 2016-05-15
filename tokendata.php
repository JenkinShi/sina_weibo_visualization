<?php
session_start();

if (isset($_SESSION['user'])){
    set_time_limit(0); //无限请求超时时间

    $mysql = new mysqli('127.0.0.1','root','070832', 'srtp', 3306);
	mysqli_query($mysql, "SET NAMES UTF8");
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
	    	//找10个话题
	    	if(sizeof($topic)<10){
	    		//echo $timeid . "--" . $t. "--" . $n;
	    		//print_r($beginTopic);
	    		//echo "<br>" ;
	    		if(in_array($t, $beginTopic)){
	    			//echo "in"."<br>";
		    		array_push($topic, $t);
		    		array_push($num, $n);
	    		}
	    		if($rank==50 && sizeof($topic)<10){
	    			//echo $timeid;
	    			//echo "--数据异常--" ;
	    			foreach($beginTopic as $tt){
						if(!in_array($tt, $topic)){
							//echo $tt . "--没了--";
							array_push($topic, $tt);
		    				array_push($num, 10000);
						}
					}
					//echo "topic已经修复至".sizeof($topic). "<br>";
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
	//print_r($all);
	//print_r($time);

	$k = $_SESSION['k'];

	$data = $all[$k];
	$time = $times[$k];
	//print_r($token_data);
	$token_data = array("data"=>$data, "time"=>$time);
	$token_data_json = json_encode($token_data);
	//$token_data_json = preg_replace("#\\\u([0-9a-f]+)#ie", "iconv('UCS-2', 'UTF-8', pack('H4', '\\1'))", $token_data_json);
	//print_r($token_data_json);
	echo $token_data_json;

	$_SESSION['k']++;

}
else{
        
}

?>

