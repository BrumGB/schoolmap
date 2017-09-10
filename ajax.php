<?php 
$postcode = $_GET['postcode'];
$ch = curl_init();
$timestamp = str_replace('+00:00', '.000Z', gmdate('c'));

$data = array(
	'apiKey' => 'TweepCareers_BsfNjncxjqn',
	'timestamp' => $timestamp,
	'postcode' => $postcode,
	);
$searchUrl = '/search?'.http_build_query($data); 
$secret = "3gfpSfHgmHbHFmtjcb&iytQc6NetExatsvbsvbcikqm8fbfh)Fccb2Df*hSqcdAm{ufgpvwnvz";
$authorization = base64_encode( hash_hmac('sha256',$searchUrl,$secret,true));

curl_setopt($ch, CURLOPT_URL,"https://sandbox-schools-api.192.com{$searchUrl}");

curl_setopt($ch,CURLOPT_HTTPHEADER, array('Authorization: '.$authorization));
curl_setopt($ch, CURLINFO_HEADER_OUT, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);
// receive server response ...
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$server_output = curl_exec ($ch);

curl_close ($ch);

echo $server_output; exit;
 ?>
