<?php
header("Content-Type: text/html;charset=utf-8");
session_start();

if (isset($_SESSION['user'])){

    $topic = $_POST['topic'];
    $time_start = substr($_POST['time_start'],0,13);
    $time_end = substr($_POST['time_end'],0,13);

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
	$text = "";
	$user = array();
	$weibo = array();
	$results = mysqli_query($mysql, "SELECT * FROM weibo where topic='$topic' && time >= '$time_start' && time <= '$time_end' ");
	while($row = mysqli_fetch_array($results)){
		array_push($user, $row['person']);
		array_push($weibo, $row['content']);
		$text = $text . $row['content'] . "\n";
	}
	//echo $text;
	//print_r($user);
	//print_r($weibo);

	$cws = scws_open();
	scws_set_charset($cws, "utf8");
	scws_set_dict($cws, ini_get('scws.default.fpath') . '/dict.utf8.xdb');
	scws_set_rule($cws, ini_get('scws.default.fpath') . '/rules.utf8.ini');

	scws_send_text($cws, $text);
	$list = scws_get_tops($cws, 20, "~v");
	$cloud = array();
	foreach ($list as $tmp)
	{
		//printf("%02d. %-24.24s %-4.2s  %.2f(%d)\n", $cnt, $tmp['word'], $tmp['attr'], $tmp['weight'], $tmp['times']);
		$obj = array("text" => $tmp['word'], "size" => $tmp['weight']);
		array_push($cloud, $obj);
	}
	//print_r($cloud);

	$data = array("user"=>$user, "weibo"=>$weibo, "word_cloud"=>$cloud);

	$data_json = json_encode($data);
	echo $data_json;

	scws_close($cws);

}
else{
        
}

?>

