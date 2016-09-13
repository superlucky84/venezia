var http     = require('http');
var socketio = require('socket.io');
var mysql    = require('mysql');

var client = mysql.createConnection({
	user : 'root',
	password : 'dnwlsrla',
	database : 'chatgame'
});

var server = http.createServer().listen(50000,function(){
    console.log('Server Running at http server');
});


function getDateTime(d_obj,only_date){
	if(!d_obj){
		d_obj = new Date();
	}
	var year   = String(d_obj.getFullYear());
	var month  = String(d_obj.getMonth()+1).replace(/^([0-9])$/,"0$1");
	var day    = String(d_obj.getDate()).replace(/^([0-9])$/,"0$1");
	var hour   = String(d_obj.getHours()).replace(/^([0-9])$/,"0$1");
	var minute = String(d_obj.getMinutes()).replace(/^([0-9])$/,"0$1");
	var second = String(d_obj.getSeconds()).replace(/^([0-9])$/,"0$1");
	if(only_date){
		return year+"-"+month+"-"+day;
	}else{
		return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
	}
}

/*
 * 게임 키워드 사전
 */
var chat_keyword = {
	"javascript" : ["abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield", "Array", "Date", "eval", "function", "hasOwnProperty", "Infinity", "isFinite", "isNaN", "isPrototypeOf", "length", "Math", "NaN", "name", "Number", "Object", "prototype", "String", "toString", "undefined", "valueOf", "getClass", "java", "JavaArray", "javaClass", "JavaObject", "JavaPackage", "alert", "all", "anchor", "anchors", "area", "assign", "blur", "button", "checkbox", "clearInterval", "clearTimeout", "clientInformation", "close", "closed", "confirm", "constructor", "crypto", "decodeURI", "decodeURIComponent", "defaultStatus", "document", "element", "elements", "embed", "embeds", "encodeURI", "encodeURIComponent", "escape", "event", "fileUpload", "focus", "form", "forms", "frame", "innerHeight", "innerWidth", "layer", "layers", "link", "location", "mimeTypes", "navigate", "navigator", "frames", "frameRate", "hidden", "history", "image", "images", "offscreenBuffering", "open", "opener", "option", "outerHeight", "outerWidth", "packages", "pageXOffset", "pageYOffset", "parent", "parseFloat", "parseInt", "password", "pkcs11", "plugin", "prompt", "propertyIsEnum", "radio", "reset", "screenX", "screenY", "scroll", "secure", "select", "self", "setInterval", "setTimeout", "status", "submit", "taint", "text", "textarea", "top", "unescape", "untaint", "window", "onblur", "onclick", "onerror", "onfocus", "onkeydown", "onkeypress", "onkeyup", "onmouseover", "onload", "onmouseup", "onmousedown", "onsubmit"],

	"java" : ["abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "continue", "default", "do", "double", "else", "enum", "extends", "false", "final", "finally", "float", "for", "if", "implements", "import", "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "stricttp", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "void", "volatile", "while",'AlphaComposite', 'AWTEvent', 'AWTEventMulticaster', 'AWTKeyStroke', 'AWTPermission', 'BasicStroke', 'BorderLayout', 'BufferCapabilities', 'FlipContents', 'Button', 'Canvas', 'CardLayout', 'Checkbox', 'CheckboxGroup', 'CheckboxMenuItem', 'Choice', 'Color', 'Component', 'ComponentOrientation', 'Container', 'ContainerOrderFocusTraversalPolicy', 'Cursor', 'DefaultFocusTraversalPolicy', 'DefaultKeyboardFocusManager', 'Desktop', 'Dialog', 'Dimension', 'DisplayMode', 'Event', 'EventQueue', 'FileDialog', 'FlowLayout', 'FocusTraversalPolicy', 'Font', 'FontMetrics', 'Frame', 'GradientPaint', 'Graphics', 'Graphics2D', 'GraphicsConfigTemplate', 'GraphicsConfiguration', 'GraphicsDevice', 'GraphicsEnvironment', 'GridBagConstraints', 'GridBagLayout', 'GridBagLayoutInfo', 'GridLayout', 'Image', 'ImageCapabilities', 'Insets', 'JobAttributes', 'DefaultSelectionType', 'DestinationType', 'DialogType', 'MultipleDocumentHandlingType', 'SidesType', 'KeyboardFocusManager', 'Label', 'LinearGradientPaint', 'List', 'MediaTracker', 'Menu', 'MenuBar', 'MenuComponent', 'MenuItem', 'MenuShortcut', 'MouseInfo', 'MultipleGradientPaint', 'PageAttributes', 'ColorType', 'MediaType', 'OrientationRequestedType', 'OriginType', 'PrintQualityType', 'Panel', 'Point', 'PointerInfo', 'Polygon', 'PopupMenu', 'PrintJob', 'RadialGradientPaint', 'Rectangle', 'RenderingHints', 'Key', 'Robot', 'Scrollbar', 'ScrollPane', 'ScrollPaneAdjustable', 'SplashScreen', 'SystemColor', 'SystemTray', 'TextArea', 'TextComponent', 'TextField', 'TexturePaint', 'Toolkit', 'TrayIcon', 'Window'],

	"php" : ["__halt_compiler", "abstract", "and", "array", "as", "break", "callable", "case", "catch", "class", "clone", "const", "continue", "declare", "default", "die", "do", "echo", "else", "elseif", "empty", "enddeclare", "endfor", "endforeach", "endif", "endswitch", "endwhile", "eval", "exit", "extends", "final", "for", "foreach", "function", "global", "goto", "if", "implements", "include", "include_once", "instanceof", "insteadof", "interface", "isset", "list", "namespace", "new", "or", "print", "private", "protected", "public", "require", "require_once", "return", "static", "switch", "throw", "trait", "try", "unset", "use", "var", "while", "xor","__CLASS__", "__DIR__", "__FILE__", "__FUNCTION__", "__LINE__", "__METHOD__", "__NAMESPACE__", "__TRAIT__",'GLOBALS', '_SERVER', '_GET', '_POST', '_FILES', '_REQUEST', '_COOKIE', '_SESSION', '_PHP_SELF', 'php_errormsg', 'PHP_SELF', 'argv', 'argc', 'GATEWAY_INTERFACE', 'SERVER_ADDR', 'SERVER_NAME', 'SERVER_SOFTWARE', 'SERVER_PROTOCOL', 'REQUEST_METHOD', 'REQUEST_TIME', 'QUERY_STRING', 'DOCUMENT_ROOT', 'HTTP_ACCEPT', 'HTTP_ACCEPT_CHARSET', 'HTTP_ACCEPT_ENCODING', 'HTTP_ACCEPT_LANGUAGE', 'HTTP_CONNECTION', 'HTTP_HOST', 'HTTP_REFERER', 'HTTP_USER_AGENT', 'HTTPS', 'REMOTE_ADDR', 'REMOTE_HOST', 'REMOTE_PORT', 'SCRIPT_FILENAME', 'SERVER_ADMIN', 'SERVER_PORT', 'SERVER_SIGNATURE', 'PATH_TRANSLATED', 'SCRIPT_NAME', 'REQUEST_URI', 'PHP_AUTH_DIGEST', 'PHP_AUTH_USER', 'PHP_AUTH_PW', 'AUTH_TYPE'],

	".net" : ["abstract", "as", "ascending", "async", "await", "base", "bool", "break", "byte", "case", "catch", "char", "checked", "class", "const", "continue", "decimal", "default", "delegate", "descending", "do", "double", "dynamic", "else", "enum", "equals", "event", "explicit", "extern", "false", "finally", "fixed", "float", "for", "foreach", "from", "get", "goto", "group", "if", "implicit", "in", "int", "interface", "internal", "is", "join", "let", "lock", "long", "namespace", "new", "null", "object", "operator", "orderby", "out", "override", "params", "private", "protected", "public", "readonly", "ref", "return", "sbyte", "sealed", "select", "set", "short", "sizeof", "stackalloc", "static", "string", "struct", "switch", "this", "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using", "value", "var", "virtual", "void", "volatile", "where", "while", "yield", "ArrayList", "Buffer", "Console", "DataRow", "DataSet", "DataTable", "DataView", "Dictionary", "Directory", "Environment", "File", "FileInfo", "Hashtable", "IComparable", "IEnumerable", "KeyValuePair", "List", "Math", "Object", "Path", "Process", "Random", "Regex", "SqlClient", "SqlConnection", "SqlParameter", "Stopwatch", "StreamReader", "StreamWriter", "String", "StringBuilder", "Thread", "Timer", "TimeSpan", "Tuple", "XElement", "XmlReader", "XmlWriter"]
};

// 레벨 별 내려가는 속도 (마이크로 초)
var level_to_speed = {
	1  : 1000,
	2  : 1000,
	3  : 1000,
	4  : 1000,
	5  : 1000,
	6  : 850,
	7  : 700,
	8  : 550,
	9  : 400,
	10 : 250
};

var screen_px = {
	1 : 750,
	2 : 1005,
	3 : 1220,
	4 : 1449,
	5 : 1566
};

var screen_one_px = {
	1 : 664,
	2 : 440,
	3 : 349,
	4 : 310,
	5 : 265
};



var room_list = {};
var user_list = {};

// 방 리스트 가공하여 클라이언트에 전달하기
function make_room_list(room_list,publish_type){
	//room_stat 이 end인 것을 지워준다
	var worked_list = {};
	for( var rom_seq in room_list){
		if(room_list[rom_seq].room_stat == 'end'){
			continue;
		}
		worked_list[rom_seq] = room_list[rom_seq];
	}


	// 디비에서 end인 방을 추가한다.
	var getgame_sql = '\
		SELECT \
			* \
		FROM \
			game_result \
		WHERE \
			regdate BETWEEN "'+getDateTime(false,true)+' 00:00:00" and "'+getDateTime(false,true)+' 23:59:59" \
		ORDER BY \
			regdate DESC \
	';
	client.query(getgame_sql,function(error,results){
		for( var r_idx in results){
			results[r_idx].regdate = getDateTime(results[r_idx].regdate);
			worked_list[results[r_idx].game_seq] = {
				'room_name' : results[r_idx].roomname,
				'creater'   : '',
				'reg_date'  : results[r_idx].regdate,
				'room_stat' : 'end',
				'ranking'   : JSON.parse(results[r_idx].order.replace(/'/g,'"'))
			};
		}
		if(publish_type=='all'){
			io.sockets.emit('room_list', worked_list);
		}else{
			io.sockets.connected[publish_type].emit('room_list',worked_list);
		}
		//io.sockets.connected[socket.id].emit('view_user_ok',results);
	})


}

// 게임에 참여중인 유저 인지 체크
function user_sch(nickname){
	for (var list_key in user_list) {
		var list_obj = user_list[list_key];
		if(list_obj[nickname] && list_obj[nickname]['out_chk']==false){
			return true;
		}
	}
	return false;
}
// 방에 참여중인 유저 명 수 리턴
function room_in_user_cnt(roomname){
	var cnt = 0;
	for( var nickname in user_list[roomname]){
		if(user_list[roomname][nickname].out_chk==false){
			cnt++;
		}
	}
	return cnt;
}
// 게임종료된 방인지 체크
function room_game_end_chk(roomname){
	var chk_cnt = 0;
	var all_cnt = Object.keys(user_list[roomname]).length;

	for( var userKey in user_list[roomname]){
		if(user_list[roomname][userKey].gameover){
			chk_cnt++;
		}
	}
	return all_cnt - chk_cnt + 1;

	/*
	if(all_cnt == chk_cnt){
		return true;
	}else{
		return false;
	}
	*/
}

var io = socketio.listen(server);
io.set( 'origins', '*:*' );
io.of('/vc');
io.sockets.on('connection', function (socket) {


	var user_info = {};

	function userinfo_init(){
		user_info = { 
			nickname : '',      // 닉네임
			roomname : '',		// 방이름
			language : 'javascript',
			intervalobj : null,
			level : 1,          // 레벨
			life  : 9,         // 생명
			hit_cnt  : 0,      // 히트 카운트
			flow_cnt : 0,     // 게임 총 Flow Count
			spend_time : 0,     // 게임 총 소요시간
			rain_array : [],
		};
	}
	userinfo_init();



	function screen_calcul(user_list_room,roomname){

		//user_list_room
		var user_count = Object.keys(user_list_room).length;
		var screen_persent = Math.floor(100 / user_count) -1 ;
		console.log('user_count');
		console.log(user_count);

		room_list[roomname]['screen__width_px'] = screen_one_px[user_count];

		room_list[roomname]['point_one'] = Math.floor(( room_list[roomname]['screen__width_px'] - 219 ) / 2);
		room_list[roomname]['point_two'] = Math.floor(room_list[roomname]['point_one']+219);

		console.log("point_one");
		console.log(room_list[roomname]['point_one']);
		console.log("point_two");
		console.log(room_list[roomname]['point_two']);
		console.log("");

	}



	function exit_room(out_type){

		if(user_info.nickname==''){
			return false;
		}

		// 방상태 (진행중 또는 대기중)
		var room_stat = room_list[user_info.roomname].room_stat;


		// 반복 멈춤
		clearInterval(user_info.intervalobj);

		if(out_type=='self'){


			io.sockets.connected[socket.id].emit('join_exit_ok',true);

			// 룸에서 나감
			socket.leave(user_info.roomname);

		}

		// 유저 삭제
        if(user_info.nickname && user_list[user_info.roomname][user_info.nickname]){

			if(room_stat=='ing'){
				user_list[user_info.roomname][user_info.nickname]['out_chk'] = true;
			}
			else{
				delete user_list[user_info.roomname][user_info.nickname];
			}

        }

		// 방 삭제
		var exist_user_cnt = (room_stat=='ing')?room_in_user_cnt(user_info.roomname):Object.keys(user_list[user_info.roomname]).length;

		if(exist_user_cnt==0){
			delete user_list[user_info.roomname];
			delete room_list[user_info.roomname];
		}else{
			// 유저리스트 갱신
			io.sockets.in(user_info.roomname).emit('user_list',user_list[user_info.roomname]);
			screen_calcul(user_list[user_info.roomname],user_info.roomname);
		}


		// user_info 초기화
		userinfo_init();

	}


	function interval_action(){

		// 단어배열에서 랜덤하게 하나 가져온다
		var randomRange = chat_keyword[user_info.language].length;
		var randomInt   = Math.floor(Math.random() * randomRange);

		// 파괴해야할 단어 배열
		var destroy_array = [];

		// 기존 배열에 w_top 갱신
		//for( var word_depth in user_info.rain_array ){
		//for( var word_depth in user_info.rain_array ){
		for (var word_depth = 0; word_depth < user_info.rain_array.length; word_depth++) {

			user_info.rain_array[word_depth].w_top += 20;

			// 680을 넘으면 파괴
			var standard_line = 680;

			var w_left_px = user_info.rain_array[word_depth].left;
			var w_length = user_info.rain_array[word_depth].word.length;

			if(w_left_px < room_list[user_info.roomname]['point_two'] && w_left_px+(w_length*10) > room_list[user_info.roomname]['point_one'] ){
				standard_line -= 65;
			}

			if(user_info.rain_array[word_depth].w_top > standard_line){
				destroy_array = user_info.rain_array.splice(word_depth,1);
				user_info.life--;
				break;
			}
		}
		
		// Interval 마다 배열에 푸시
		var calcul_level = (user_info.level > 5)?5:user_info.level;
		var speed = parseInt(6-calcul_level);
		if(user_info.flow_cnt % speed == 0 ){

			var word = chat_keyword[user_info.language][randomInt];
			//var left_px = screen__width_px * (Math.floor(Math.random() * 100) / 100);
			var left_px = room_list[user_info.roomname]['screen__width_px'] * (Math.floor(Math.random() * 100) / 100);

			if((word.length * 9) + left_px > room_list[user_info.roomname]['screen__width_px']){
				left_px -= word.length * 9;
			}

			user_info.rain_array.push({
				'word'     : word,
				'w_top'    : 0,
				'flow_cnt' : user_info.flow_cnt,
				//'left'   : Math.floor(Math.random() * 100)
				'left'     : left_px
			});
		}

		// : 단어가 내려가도록 top 을 갱신한다
		//io.sockets.connected[socket.id].emit('word_rain',word_rain);
		//io.sockets.emit('word_rain',{
		io.sockets.in(user_info.roomname).emit('word_rain',{
			'nickname'   : user_info.nickname,
			'rain_array' : user_info.rain_array,
			'destroy_array' : destroy_array
		});

		// 생명이 0이면 Interval 을 멈추고 결과화면으로 나간다.
		if( user_info.life === 0 ){

			// 게임오버 플레그를 바꿔준다.
			user_list[user_info.roomname][user_info.nickname].gameover = true;

			// 게임내 랭킹을 박아준다.
			var ranking = room_game_end_chk(user_info.roomname);
			user_list[user_info.roomname][user_info.nickname].ranking = ranking;
			room_list[user_info.roomname].ranking[ranking] = user_info.nickname;


			// 게임엔드 체크를 한다.
			//if(room_game_end_chk(user_info.roomname)){
			if(ranking == 1){
				room_list[user_info.roomname].room_stat = 'end';

				// DB 저장
				var r_string = JSON.stringify(room_list[user_info.roomname].ranking).replace(/"/g,"'");
				var result_insert_sql = '\
							INSERT INTO game_result( \
									`roomname`, \
									`order`, \
									`regdate` \
							) values ( \
								"'+user_info.roomname+'", \
								"'+r_string+'", \
								"'+getDateTime()+'" \
							); \
				';
				client.query(result_insert_sql);

				// 방 갱신
				//io.sockets.emit('room_list', room_list);
				make_room_list(room_list,'all');

			}

			clearInterval(user_info.intervalobj);
			console.log("GAME OVER:"+user_info.nickname);
			//io.sockets.emit('game_over',user_info);
			io.sockets.in(user_info.roomname).emit('game_over',user_info);
		}

		// 타임증가 시키기
		user_info.flow_cnt++;

	}

	// 게임 시작됨
	socket.on('game_start',function(){
		room_list[user_info.roomname].room_stat = 'ing';
		//io.sockets.emit('room_list', room_list);
		make_room_list(room_list,'all');

		io.sockets.in(user_info.roomname).emit('game_start_deploy');
	});
	socket.on('game_start_deploy',function(){
		user_info.intervalobj = setInterval(interval_action,level_to_speed[user_info.level]);
	});


	// 방 리스트
	socket.on('room_list',function(){
		//io.sockets.connected[socket.id].emit('room_list',room_list);
		make_room_list(room_list,socket.id);

		/*room_list[roomname] = {
			'room_name' : roomname,
			'creater'   : nickname,
			'reg_date'  : now_time.getMonth()+"."+now_time.getDate()+" "+now_time.getHours()+":"+now_time.getMinutes()
		};*/

	});

	// 유저리스트에서 유저 삭제
	socket.on('delete_user',function(del_type){
		var delete_sql = '\
			DELETE FROM user \
		';
		client.query(delete_sql,function(){
			io.sockets.connected[socket.id].emit('alert-flush','모든 유저가 삭제되었습니다.');
		});
	});

	// 유저리스트
	socket.on('view_user',function(nickname,pass,start_level,language,roomname,join_type){

		var getuser_sql = '\
			SELECT \
				* \
			FROM \
				user \
			ORDER BY \
				regdate DESC \
		';

		client.query(getuser_sql,function(error,results){
			for( var r_idx in results){
				results[r_idx].regdate = getDateTime(results[r_idx].regdate);
			}
			io.sockets.connected[socket.id].emit('view_user_ok',results);
		})

	});


	// 방에 들어감
	socket.on('join_game',function(nickname,pass,start_level,language,roomname,join_type){

		if(user_sch(nickname)){
			io.sockets.connected[socket.id].emit('alert','동일한 닉네임으로 게임중입니다.');
			return false;
		}

		// 방 생성일때
		if(join_type){
			if( room_list[roomname] ){
				io.sockets.connected[socket.id].emit('alert','동일한 이름의 방이 있습니다.');
				return false;
			}
		}
		// 방 입장일때
		else{
			if(Object.keys(user_list[roomname]).length >= 5){
				io.sockets.connected[socket.id].emit('alert','참여자 5명이 다 찼습니다.');
				return false;
			}
		}

		// DB에 등록된 닉네임인지와 패스워드 체크
		var chk_sql = '\
			SELECT \
				count(*) as cnt, \
				password \
			FROM \
				user \
			WHERE \
			nickname="'+nickname+'"\
		';

		var insert_sql = '\
			INSERT INTO user( \
				nickname, \
				password, \
				regdate \
			) values ( \
				"'+nickname+'", \
				"'+pass+'", \
				"'+getDateTime()+'" \
			); \
		';

		client.query(chk_sql,function(error,results){
			// 등록 안되어 있으면 테이블에 인서트
			if(results[0]['cnt']==0){
				console.log("insert_sql");
				console.log(insert_sql);
				client.query(insert_sql);
			}
			// 등록이 되으면 패스워드 체크
			else{
				if(pass != results[0]['password']){
					io.sockets.connected[socket.id].emit('alert','닉네임 패스워드가 틀렸습니다.');
					return false;
				}
			}

			user_info.nickname    = nickname;
			user_info.start_level = start_level;
			user_info.level       = start_level;
			user_info.language    = language;
			user_info.roomname    = roomname;

			// 참여유저배열에 방 추가
			//if(room_list.indexOf(roomname) == -1){
			if( !room_list[roomname] ){
				var now_time = new Date();

				room_list[roomname] = {
					'room_name'        : roomname,
					'creater'          : nickname,
					'reg_date'         : now_time.getMonth()+"."+now_time.getDate()+" "+now_time.getHours()+" : "+now_time.getMinutes(),
					'room_stat'        : 'standby', //ing, standby, end
					'ranking'          : {},
					'point_one'        : 0,
					'point_two'        : 0,
					'screen__width_px' : 0,
				};
			}
			if( !user_list[roomname] ){
				user_list[roomname] = {};
			}


			// 참여유저배열에 닉네임 추가.
			if( !user_list[roomname][nickname] ){
				user_list[roomname][nickname] = { 
					'nickname' : nickname,
					'level'    : start_level,
					'language' : language,
					'out_chk'  : false,
					'gameover' : false,
					'ranking'  : 0
				};
			}


			// 룸에 들어감
			socket.join(roomname);

			// 입장 성공여부 쏴주기
			io.sockets.connected[socket.id].emit('join_game_ok',true);

			// 클라이언트 유저리스트 쏴주기
			io.sockets.in(user_info.roomname).emit('user_list',user_list[roomname]);
			screen_calcul(user_list[roomname],roomname);

			/*
			 * 단어 내리기 level 1 ~ 5
			 */
			//user_info.intervalobj = setInterval(interval_action,level_to_speed[user_info.level]);


		});

	

	});

	// 단어파괴
    socket.on('destroy_word', function(destroy_obj) {


		user_info.hit_cnt++;

		// 레벨 변경 유무
		var level_change = false;

		// 해당 점수 확인하여 레벨을 올림
		if(user_info.hit_cnt % 5 == 0 && user_info.level < 10){
			level_change = true;
			user_info.level++;

			if(user_info.level >= 6){
				clearInterval(user_info.intervalobj);
				user_info.intervalobj = setInterval(interval_action,level_to_speed[user_info.level]);
			}
		}


		// 서버에서 단어를 파괴시킨다
		for(rain_obj_key in user_info.rain_array){
			if(user_info.rain_array[rain_obj_key].word == destroy_obj.d_word){
				user_info.rain_array.splice(rain_obj_key,1);
			}
		}
		
		// 클라이언트에서 단어를 파괴시킨다.
		// socket.broadcast.emit('destroy_obj', destroy_obj);
		// level 과 hit붙여서 함께 넘김
		destroy_obj.level   = user_info.level;
		destroy_obj.hit_cnt = user_info.hit_cnt;

		//io.sockets.emit('destroy_obj', destroy_obj);
		io.sockets.in(user_info.roomname).emit('destroy_obj', destroy_obj);
	});

	// 방에서 나감
	socket.on('game_exit',function(){
		exit_room('self');
	});

	// 연결끊김
    socket.on('disconnect', function() {
		exit_room('disconnect');
    });
});




