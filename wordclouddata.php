<?php
header("Content-Type: text/html;charset=utf-8");
include('connectDB.php');

session_start();

if (isset($_SESSION['user'])){

	set_time_limit(0);

    $topic = $_POST['topic'];
    $time_start = substr($_POST['time_start'],0,13);
    $time_end = substr($_POST['time_end'],0,13);

    $time_start = str_replace(" ", "-", $time_start);
    $time_end = str_replace(" ", "-", $time_end);

	$mysql = connectDB();

	$text = "";
	$user = array();
	$weibo = array();
	$results = mysqli_query($mysql, "SELECT * FROM weibo where topic='$topic' && time >= '$time_start' && time <= '$time_end' ");
	while($row = mysqli_fetch_array($results)){
		array_push($user, $row['person']);
		array_push($weibo, $row['content']);
		$text = $text . $row['content'] . "\n";
	}

	$cws = scws_open();
	scws_set_charset($cws, "utf8");
	scws_set_dict($cws, ini_get('scws.default.fpath') . '/dict.utf8.xdb');
	scws_set_rule($cws, ini_get('scws.default.fpath') . '/rules.utf8.ini');

	scws_send_text($cws, $text);
	$list = scws_get_tops($cws, 20, "~v");
	$cloud = array();
	foreach ($list as $tmp)
	{
		$obj = array("text" => $tmp['word'], "size" => $tmp['weight']);
		array_push($cloud, $obj);
	}

	$data = array("user"=>$user, "weibo"=>$weibo, "word_cloud"=>$cloud);

	$data_json = json_encode($data);
	echo $data_json;

	scws_close($cws);
	mysqli_close($mysql);
}
else{
        
}

?>

