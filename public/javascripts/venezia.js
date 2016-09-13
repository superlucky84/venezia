

// 템플레이트 정의 
venezia.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
});
venezia.directive('customButton', function () {
	return {
		templateUrl: 'screen_unit.html'
	};
});
venezia.directive('customResult', function () {
	return {
		templateUrl: 'custom_result.html'
	};
});


venezia.service('vzservice',function(){

	//this.dialog_instance = null;
	//this.main_scope = null;
	//this.main_scope_setting = function($scope){
		//this.main_scope = $scope;
	//}

	// 유저 영역 넓이 맞추기
	this.room_reload = function( user_count ){
		
		var screen_px = {
			1 : 750,
			2 : 1005,
			3 : 1220,
			4 : 1449,
			5 : 1566
		};

		var screen_persent = Math.floor(100 / user_count) -1 ;
		angular.element(".user_screen").css('width',screen_persent+'%');
		angular.element(".mainpage").css('width',screen_px[user_count]+'px');



		// 지정 크기보다 작으면 scale 적용
		var xx = 1;
		if(screen_px[user_count] > document.body.clientWidth){
			xx = document.body.clientWidth / screen_px[user_count];
		}
		var yy = 1;
		if(720 > window.innerHeight){
			yy = window.innerHeight / 720;
		}

		var scale = (xx < yy)?xx:yy;

		$('.transarea').css('transform', 'scale(' + scale + ')');
		$('.transarea').addClass('scale');

		
	}

	this.array_diff = function(a,b){
		var tmp={}, res=[];
		for(var i=0;i<a.length;i++) tmp[a[i]]=1;
		for(var i=0;i<b.length;i++) { if(tmp[b[i]]) delete tmp[b[i]]; }
		for(var k in tmp) res.push(k);
		return res;
	}
})

venezia.controller('gameController', function ($scope,$http,$compile,$cookieStore,$modal,vzservice) {

	$scope.join_type   = false;
	$scope.join        = false;
	$scope.nickname    = "";
	$scope.nic_pass    = "";
	$scope.word_lang   = 0;
	$scope.start_level = 0;
	$scope.roomname_select = '';


	$scope.wait_room_list = {};
	$scope.end_room_list  = {};
	$scope.ing_room_list  = {};

	$scope.room_type = "wait";
	//$scope.$apply();


	$scope.user_list = {};

	var socket = io.connect('http://104.236.113.81:50000');


	console.log('room_list');
	socket.emit('room_list');



	/*
	 * 리사이즈 이벤트
	 */
	angular.element(window).resize(function(){
		vzservice.room_reload(Object.keys($scope.user_list).length);
	});


	/*
	 * 인풋박스에 입력시
	 */
	$scope.target_destroy = function(event){

		var $chk_match = angular.element("#location_me .user_sky .word_position[data-word='"+$scope.handle+"']");
		if($chk_match.length > 0 ){
			socket.emit('destroy_word',{
				'nickname' : $scope.nickname,
				'd_word'   : $scope.handle
			});
		}
		$scope.handle = "";
	}

	/*
	 * 참여타입
	 */
	$scope.jointype = function(event,jointype){
		$scope.join_type = (!!jointype);
	}


	/*
	 *룸 타입 클릭
	 */
	$scope.roomtypechange = function(event,roomtype){
		$scope.room_type = roomtype;
	}


	/*
	 * 등록된 유저 전부삭제
	 */
	$scope.delete_user = function(event,del_type){
		if(del_type=='all'){
			socket.emit('delete_user','all');
		}
	}

	/*
	 * 종료된 게임 랭킹보기
	 */
	$scope.view_ranking = function(event){
		var $vv = $(event.currentTarget).find('.rk_area');

		if($vv.css("display") == "none"){
			$vv.show();
		}
		else{
			$vv.hide();
		}


			/*
		var $user_list = angular.element(".user_list");
		if($user_list.css("display") == "none"){
			socket.emit('view_user');
			$(event.currentTarget).addClass('active');
			$user_list.show();
		}
		else{
			$(event.currentTarget).removeClass('active');
			$user_list.hide();
		}
		*/

	}


	/*
	 * 등록된 유저 보기
	 */
	$scope.view_user = function(event){

		var $user_list = angular.element(".user_list");
		if($user_list.css("display") == "none"){
			socket.emit('view_user');
			$(event.currentTarget).addClass('active');
			$user_list.show();
		}
		else{
			$(event.currentTarget).removeClass('active');
			$user_list.hide();
		}

	}
	socket.on('view_user_ok',function(user_list){
		console.log('user_list');
		console.log(user_list);
		$scope.user_list = user_list;
		$scope.$apply();
	});



	/*
	 * 게임시작
	 */
	$scope.game_start = function(event){
		socket.emit('game_start');
	}
	socket.on('game_start_deploy',function(room_list){
		socket.emit('game_start_deploy');
		//angular.element(".c_button_ing").html(angular.element(".c_button>#exit_game"));

		

		angular.element(".c_button").remove();
	});

	/*
	 * 게임나가기
	 */
	$scope.game_exit = function(event){
		socket.emit('game_exit');
	}
	socket.on('join_exit_ok',function(result){
		if(result){
			$scope.join = false;
			$scope.$apply();
			$("html").css("background-color","#fff");
		}
	});




	/*
	 * 입장
	 */
	$scope.join_game = function(event){

		if($scope.join_type){
			if(!$scope.roomname){
				alert('방이름을 입력해주세요.');
				return false;
			}
		}else{
			console.log($scope.roomname_select);
			console.log($scope.roomname_select);
			if(!$scope.roomname_select){
				alert('방을 선택해주세요.');
				return false;
			}
			$scope.roomname = $scope.roomname_select;
		}

		if(!$scope.nickname){
			alert('닉네임을 입력해주세요.');
			return false;
		}
		if(!$scope.nic_pass){
			alert('패스워드를 입력해주세요.');
			return false;
		}
		if(!$scope.start_level){
			alert('시작레벨을 입력해주세요.');
			return false;
		}
		if(!$scope.word_lang){
			alert('언어를 선택해주세요.');
			return false;
		}

		socket.emit('join_game',$scope.nickname,$scope.nic_pass,$scope.start_level,$scope.word_lang,$scope.roomname,$scope.join_type);


	}

	/*
	 * 방 입장완료 콜백
	 */
	socket.on('join_game_ok',function(result){

		$scope.join = result;
		$scope.$apply();

		if(result){
			$("html").css("background-color","#000");
		}

		var $HANDLE = angular.element("#location_me  .user_handle");
		$HANDLE.find(".h_level").html($scope.start_level);
		$HANDLE.find(".h_lang").html($scope.word_lang);
		$HANDLE.find(".nickname").html($scope.nickname);
		$HANDLE.find(".h_hit").html(0);

		// 쿠키로 굽기
		//$cookieStore.put('vzuser_nic',$scope.nickname);
	});

	/*
	 * 서버에서 클라이언트의 얼럿 띄우기
	 */
	socket.on('alert',function(msg){
		alert(msg);
	});
	socket.on('alert-flush',function(msg){
		//alert(msg);
		location.reload();
	});


	/*
	 * 룸리스트
	 */
	socket.on('room_list',function(room_list){
		console.log(room_list);
		console.log(Object.keys(room_list).length);
		if(Object.keys(room_list).length == 0){
			$scope.join_type = true;
		}else{
			$scope.join_type = false;
		}

		// 룸리스트를 화면에 뿌리기


		var standbyArray = [];
		var ingArray = [];
		var endArray = [];
		for(var o in room_list) {

			if(room_list[o].room_stat == 'standby'){
				standbyArray.push(room_list[o]);
			}
			else if(room_list[o].room_stat == 'ing'){
				ingArray.push(room_list[o]);
			}
			else if(room_list[o].room_stat == 'end'){
				endArray.push(room_list[o]);
			}
		}

		$scope.wait_room_list = standbyArray;
		$scope.ing_room_list  = ingArray;
		$scope.end_room_list  = endArray;

		console.log($scope.wait_room_list);
		console.log($scope.ing_room_list);
		console.log($scope.end_room_list);


		$scope.$apply();

	});



	/*
	 * 게임오버
	 */
	socket.on('game_over',function(info){


		if($scope.nickname == info.nickname){
			var $SKY = angular.element("#location_me  .user_sky");
		}else{
			var $SKY = angular.element("#userid_"+info.nickname+"  .user_sky");
		} 

		var result_buffer = [];
		result_buffer.push('nickname : ' + info.nickname);
		result_buffer.push('language : ' + info.language);
		result_buffer.push('level : ' + info.level);
		result_buffer.push('hit_cnt : ' + info.hit_cnt);
		result_buffer.push('flow_cnt : ' + info.flow_cnt);
		result_buffer.push('spend_time : ' + info.spend_time);
		result_buffer.push('level : ' + info.level);
		$SKY.after("<div class='user_result'>"+result_buffer.join('<br/>')+"</div>");
		$SKY.addClass("gameover");
		//angular.element(".user_handle").hide();
		$SKY.parent().find(".user_handle").hide();


	});

	/*
	 * 단어파괴
	 */
	socket.on('destroy_obj', function(destroy_obj) {

		if(!$scope.join){
			return false;
		}

		if($scope.nickname == destroy_obj.nickname){
			var $SKY    = angular.element("#location_me .user_sky");
			var $HANDLE = angular.element("#location_me .user_handle");
		}else{
			var $SKY    = angular.element("#userid_"+destroy_obj.nickname+" .user_sky");
			var $HANDLE = angular.element("#userid_"+destroy_obj.nickname+" .user_handle");
		} 

		$SKY.find(".word_position[data-word='"+destroy_obj.d_word+"']").hide('drop',function(){
			$(this).remove();
		});

		$HANDLE.find(".h_level").html(destroy_obj.level);
		$HANDLE.find(".h_hit").html(destroy_obj.hit_cnt);

	});

	/*
	 * 유저리스트 갱신
	 */
	socket.on('user_list', function(user_list) {

		if(!$scope.join){
			return false;
		}

		$scope.user_list = user_list;
		console.log(user_list);
		console.log('user_list');

		var user_list_nic = Object.keys(user_list);


		// 쿠키값 확인 테스트
		var vzuser_nic = $cookieStore.get('vzuser_nic');

		// 유저리스트에서 자기자신은 제거한다
		if($scope.nickname && user_list_nic.indexOf($scope.nickname) > -1){
			user_list_nic.splice(user_list_nic.indexOf($scope.nickname),1);
		}

		// UI에 그려진 유저 리스트 가져오기
		var ui_chk_array = [];
		angular.element("div[custom-button]").each(function(){
			var iid = String($(this).attr("id")).replace("userid_","");
			if(iid){
				ui_chk_array.push(iid);
			}
		});

		// 빠진 유저를 지운다.
		var diff_array = vzservice.array_diff(ui_chk_array,user_list_nic);
		for(nic in diff_array){
			$("#userid_"+diff_array[nic]).remove();
		}


		console.log('user_listuser_listuser_list');
		console.log(user_list);

		// 나를 제외한 나머지 UI를 그린다.
		for( nic in user_list_nic ){

			var l_user = user_list_nic[nic];

			if(ui_chk_array.indexOf(l_user) == -1){

				// UI를 APPEND로 붙임
				angular.element("#location_other")
					.append($compile("<div class='user_screen' custom-button id='userid_"+l_user+"'>cb</div>")($scope));

				$scope.$apply();
				angular.element("#userid_"+l_user+"  .user_handle  span.nickname").html(l_user);
				angular.element("#userid_"+l_user+"  .user_handle  input").attr('name','handle_'+l_user);
				angular.element("#userid_"+l_user+"  .user_handle  .h_level").html(user_list[l_user].level);
				angular.element("#userid_"+l_user+"  .user_handle  .h_lang").html(user_list[l_user].language);

			}
			
			// 게임중에 나간 친구이면서 gameover가 안붙었으면
			var $SKY = angular.element("#userid_"+l_user+"  .user_sky");
			if(user_list[l_user].out_chk && !$SKY.hasClass("gameover")){
				var result_buffer = [];
				result_buffer.push('game_exit');

				$SKY.after("<div style='position:relative;'><div class='user_result'>"+result_buffer.join('<br/>')+"</div></div>");
				$SKY.addClass("gameover");
			}
		}

		// 유저별 width 갱신
		vzservice.room_reload(user_list_nic.length+1);

	});

	/*
	 * 유저 단어 타겟 그리기
	 */
	socket.on('word_rain', function(word_rain) {

		if(!$scope.join){
			return false;
		}

		var rain_nic    = word_rain.nickname;
		var rain_array  = word_rain.rain_array;
		var destroy_obj = {};


		// 내 닉네임과 같을 때
		if($scope.nickname == rain_nic){
			var $SKY    = angular.element("#location_me  .user_sky");
			var $HANDLE = angular.element("#location_me  .user_handle");
		}else{
			var $SKY    = angular.element("#userid_"+rain_nic+"  .user_sky");
			var $HANDLE = angular.element("#userid_"+rain_nic+"  .user_handle");
		} 

		// 땅에 떨어진 단어 파괴하기
		if( word_rain.destroy_array.length > 0 ){
			// 단어파괴
			destroy_obj = word_rain.destroy_array[0];
			$SKY.find("span[data-stime='"+destroy_obj.flow_cnt+"']").remove();

			// 목숨차감
			var life = $HANDLE.find("button.fill").length;
			$HANDLE.find("button").eq(life-1).removeClass('fill');
		}


		// 단어 그려주기
		for( w_idx in rain_array){

			// LEFT 계산해주기
			var width = parseInt($SKY.css('width').replace("px",""));
			//var left = Math.floor(width * (rain_array[w_idx].left/100));
			var left = rain_array[w_idx].left;
			if(left < 7){ left = 7; }

			// 0일때는  어팬드
			if(rain_array[w_idx].w_top == 0){
				$SKY.append("<span class='word_position' data-word='"+rain_array[w_idx].word+"' data-stime='"+rain_array[w_idx].flow_cnt+"'>"+rain_array[w_idx].word+"</span>");

				var $WORD = $SKY.find("span[data-stime='"+rain_array[w_idx].flow_cnt+"']");
				var word_width = parseInt($WORD.css('width').replace(/[^0-9]/g,''));

				if(word_width + left > width){
					left = left - word_width;
				}
				$WORD.css("left",left+"px");

			}
			// 0이 아닐때는 css에서 높이 바꿔줌
			else{
				$SKY.find("span[data-stime='"+rain_array[w_idx].flow_cnt+"']")
					.css("top",rain_array[w_idx].w_top+"px");
			}

		}
	});
});

