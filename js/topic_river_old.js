document.write("<script src='.\/js\/d3.min.js'><\/script>");
document.write("<script src='.\/js\/jquery.min.js'><\/script>");

function topic_river(){
	const std_height = 40;
	const std_width = 100;
	const std_bubble_width = 10;
	const std_archive_width = 1.1;
	const std_per_stack_width = 7;
	const std_per_river_width = 15;
	const std_streaming_width = 20;
	const std_streaming_vertical_intervel = 2;
	const colorTable = ['#C0C0C0','#F0C0F0','#E3CF57','#FF6103','#B0E0E6',
					'#D2691E','#00C957','#808069','#FFC0CB','#3D59AB',
					'#8A2BE2','#7CFC00','#FF8000','#03A89E','#FF4500',
					'#de9c53','#823635','#89bebe','#c51f1f','#113f3d'];
	const river_intervel_rate_node = [0.8,1.0,0.3];
	const river_intervel_rate_half = [0.8,0.8,0.05];
	const circle_radius = 5;
	var streaming_token_num = 0;
	var streaming_accumulate;
	var streaming_topic_start_y;
	var streaming_topic_end_y;
	var streaming_per_width;
	var streaming_last_y;

	function real_height(h){
		return h*tg.settings.graph_height/std_height;
	}
	function real_width(w){
		return w*tg.settings.graph_width/std_width;
	}
	function value2len(v){
		return v*tg.settings.graph_height/tg.settings.max_data
	}

	function create_topic_river(){
		create_cut_off_line();

		init_topic_order();
		gen_archive();
		gen_stack_path();
		gen_stack_to_river_path();
		gen_river_path();

		tg.svg.append("g").attr("id","streaming");
	}

	function gen_archive(){
		var id = "archive";
		var path_data = [];
		tg.svg.append("g").attr("id",id);
		path_data = cal_topic_archive_pos(tg.fix_data.archive);
		for(var x of path_data){
			draw_path(x[1],x[0],id);
		}
	}

	function gen_stack_path(){
		//通过分段绘制的方式来绘制stack section，topic_pos_last代表分段左端，topic_pos_now代表分段的右端
		var stack_data, last_stack_data;
		var flag;
		var id="stack";

		tg.svg.append("g").attr("id",id);
		//初始化话题左边界的数据
		tg.topic_pos_last.x = real_width(std_bubble_width+std_archive_width); //x坐标
		tg.topic_pos_last.i = 0; //对应的大数组下标
		tg.topic_pos_last.j = 0; //对应的小树组下标
		tg.topic_pos_last.topic = cal_topic_stack_pos(tg.fix_data.stack[0][0],{}); //话题的y坐标
		for(var i=0; i<2; i++){
			flag = 0;
			for(var j=1; j<tg.fix_data.stack[0].length; j++){
				stack_data = tg.fix_data.stack[i][j];
				last_stack_data = tg.fix_data.stack[i][j-1];
				//检查是否有新的topic出现，如果出现则产生分段进行绘制
				for(var k=0; k<tg.topic_order.length; k++){
					if(stack_data[tg.topic_order[k]] == undefined){
						tg.topic_pos_now.x = real_width(
							std_bubble_width
							+std_archive_width
							+i*std_per_stack_width
							+j*std_per_stack_width/(tg.fix_data.stack[0].length-1));
						tg.topic_pos_now.i = i;
						tg.topic_pos_now.j = j;
						tg.topic_pos_now.topic = cal_topic_stack_pos(stack_data,last_stack_data);
						draw_stack_path(tg.topic_pos_last,tg.topic_pos_now,id);
						tg.topic_pos_last = tg.topic_pos_now;
						tg.topic_pos_now = new Object();
						if(j == tg.fix_data.stack[0].length-1)
							flag = 1;
						break;
					}
				}
			}
			if(flag == 0){
				tg.topic_pos_now.x = real_width(
					std_bubble_width
					+std_archive_width
					+(i+1)*std_per_stack_width);
				tg.topic_pos_now.i = i;
				tg.topic_pos_now.j = tg.fix_data.stack[0].length-1;
				tg.topic_pos_now.topic = cal_topic_stack_pos(tg.fix_data.stack[i][j-1],{});
				draw_stack_path(tg.topic_pos_last,tg.topic_pos_now,id);
				tg.topic_pos_last = tg.topic_pos_now;
				tg.topic_pos_now = new Object();
			}
		}
	}

	function gen_stack_to_river_path(){
		//通过分段绘制的方式来绘制stack to river section，topic_pos_last代表分段左端，topic_pos_now代表分段的右端
		var stack_data, last_stack_data;
		var flag;
		var id = "stack_to_river"

		tg.svg.append("g").attr("id",id);

		flag = 0;
		var i = 2;
		for(var j=1; j<tg.fix_data.stack[0].length; j++){
			stack_data = tg.fix_data.stack[i][j];
			last_stack_data = tg.fix_data.stack[i][j-1];
			//检查是否有新的topic出现，如果出现则产生分段进行绘制
			for(var k=0; k<tg.topic_order.length; k++){
				if(stack_data[tg.topic_order[k]] == undefined){
					tg.topic_pos_now.x = real_width(
						std_bubble_width
						+std_archive_width
						+i*std_per_stack_width
						+j*std_per_stack_width/(tg.fix_data.stack[0].length-1));
					tg.topic_pos_now.i = i;
					tg.topic_pos_now.j = j;
					if(j == tg.fix_data.stack[0].length-1){
						tg.topic_pos_now.topic = cal_topic_river_pos(stack_data,last_stack_data,true,2);
						flag = 1;
					}
					else{
						tg.topic_pos_now.topic = cal_topic_river_pos(stack_data,last_stack_data,false,2);
					}
					draw_river_path(tg.topic_pos_last,tg.topic_pos_now,id);
					tg.topic_pos_last = tg.topic_pos_now;
					tg.topic_pos_now = new Object();
					break;
				}
			}
		}
		if(flag == 0){
			tg.topic_pos_now.x = real_width(
				std_bubble_width
				+std_archive_width
				+(i+1)*std_per_stack_width);
			tg.topic_pos_now.i = i;
			tg.topic_pos_now.j = tg.fix_data.stack[0].length-1;
			tg.topic_pos_now.topic = cal_topic_river_pos(tg.fix_data.stack[i][j-1],{},true,2);
			draw_river_path(tg.topic_pos_last,tg.topic_pos_now,id);
			tg.topic_pos_last = tg.topic_pos_now;
			tg.topic_pos_now = new Object();
		}
	}

	function gen_river_path(){
		//通过分段绘制的方式来绘制river section，topic_pos_last代表分段左端，topic_pos_now代表分段的右端
		var river_data, last_river_data;
		var flag;
		var id = "river"

		tg.svg.append("g").attr("id",id);

		
		for(var i=0; i<3; i++){
			flag = 0;
			for(var j=1; j<tg.fix_data.river[0].length; j++){
				river_data = tg.fix_data.river[i][j];
				last_river_data = tg.fix_data.river[i][j-1];
				//检查是否有新的topic出现，如果出现则产生分段进行绘制
				for(var k=0; k<tg.topic_order.length; k++){
					if(river_data[tg.topic_order[k]] == undefined){
						tg.topic_pos_now.x = real_width(
							std_bubble_width
							+std_archive_width
							+std_per_stack_width*3
							+i*std_per_river_width
							+j*std_per_river_width/(tg.fix_data.river[0].length-1));
						tg.topic_pos_now.i = i;
						tg.topic_pos_now.j = j;
						if(j == tg.fix_data.river[0].length-1){
							if(i == 2)
								tg.topic_pos_now.topic = cal_topic_river_pos(river_data,last_river_data,true,1);
							else
								tg.topic_pos_now.topic = cal_topic_river_pos(river_data,last_river_data,true,0);
							flag = 1;
						}
						else{
							if(i == 2)
								tg.topic_pos_now.topic = cal_topic_river_pos(river_data,last_river_data,false,1);
							else
								tg.topic_pos_now.topic = cal_topic_river_pos(river_data,last_river_data,false,0);
						}
						draw_river_path(tg.topic_pos_last,tg.topic_pos_now,id);
						tg.topic_pos_last = tg.topic_pos_now;
						tg.topic_pos_now = new Object();
						break;
					}
				}
			}
			if(flag == 0){
				tg.topic_pos_now.x = real_width(
					std_bubble_width
					+std_archive_width
					+std_per_stack_width*3
					+(i+1)*std_per_river_width);
				tg.topic_pos_now.i = i;
				tg.topic_pos_now.j = tg.fix_data.river[0].length-1;
				if(i == 2)
					tg.topic_pos_now.topic = cal_topic_river_pos(river_data,{},true,1);
				else
					tg.topic_pos_now.topic = cal_topic_river_pos(river_data,{},true,0);
				draw_river_path(tg.topic_pos_last,tg.topic_pos_now,id);
				tg.topic_pos_last = tg.topic_pos_now;
				tg.topic_pos_now = new Object();
			}
		}
	}

	function gen_streaming_path(token){
		var start_x = real_width(std_bubble_width
					+std_archive_width
					+std_per_stack_width*3
					+std_per_river_width*3);
		var end_x = start_x+real_width(std_streaming_width);
		var new_topic = [];
		var name;
		var i,j;
		var now_x = start_x + streaming_per_width*streaming_token_num;
		var last_x = start_x + streaming_per_width*(streaming_token_num-1);
		var id = "streaming";

		

		//找出是否有新话题出现
		for(var x in token){
			if(tg.topic_order.indexOf(x) == -1){
				new_topic.push(x);
				if(!tg.topic_color.has(x)){
					tg.topic_color.set(x,tg.colorPoint);
					tg.colorPoint = (++tg.colorPoint)%colorTable.length;
					add_color_index_item(x);
				}
			}
		}

		j = 0;
		for(i=0; i<tg.topic_order.length; i++){
			name = tg.topic_order[i];
			if(token[name] == undefined){
				var new_name = new_topic[j];
				var new_last_y = streaming_last_y.get(name)
									-value2len(streaming_accumulate[streaming_token_num-1][name])/2
									-value2len(token[new_name]/2);
				var new_start_y = get_new_curve_start_y(
									last_x,
									new_last_y,
									end_x,
									streaming_topic_end_y.get(name),
									(start_x+end_x)/2);
				var new_end_y = streaming_topic_end_y.get(name);
				var new_now_y = get_curve_y(
									start_x,
									new_start_y,
									end_x,
									new_end_y,
									now_x);
				draw_streaming_path(
					last_x,
					new_last_y,
					now_x,
					new_now_y,
					value2len(token[new_name]),
					value2len(token[new_name]),
					new_name,
					id
				);
				//建立新话题
				streaming_topic_start_y.set(new_name,new_start_y);
				streaming_topic_end_y.set(new_name,new_end_y);
				streaming_last_y.set(new_name,new_now_y);
				//删除旧话题
				streaming_topic_start_y.delete(name);
				streaming_topic_end_y.delete(name);
				streaming_last_y.delete(name);
				//更新topic_order
				tg.topic_order[i] = new_topic[j];
				j++;
			}
			else{
				var now_y = get_curve_y(
								start_x,
								streaming_topic_start_y.get(name),
								end_x,
								streaming_topic_end_y.get(name),
								now_x
							);
				draw_streaming_path(
					last_x,
					streaming_last_y.get(name),
					now_x,
					now_y,
					value2len(streaming_accumulate[streaming_token_num-1][name]),
					value2len(token[name]),
					name,
					id
				);
				//更新lasy_y
				streaming_last_y.set(name,now_y);
			}
		}

	}

	function init_topic_order(){
		tg.topic_pos_last = new Object();
		tg.topic_pos_now = new Object();

		tg.topic_order = [];
		tg.topic_color = new Map();
		tg.colorPoint = 0;
		var i=0;
		for(x in tg.fix_data.stack[0][0]){
			tg.topic_order[i] = x;
			if(!tg.topic_color.has(x)){
				tg.topic_color.set(x,tg.colorPoint);
				tg.colorPoint = (++tg.colorPoint)%colorTable.length;
				add_color_index_item(x);
			}
			i++;
		}
	}

	function cal_topic_archive_pos(data){
		var i,j;
		var sum = 0;
		var length;
		var rate;
		var path_data = new Map();

		for(var x in data){
			if(!tg.topic_color.has(x)){
				tg.topic_color.set(x,tg.colorPoint);
				tg.colorPoint = (tg.colorPoint+1)%colorTable.length;
				add_color_index_item(x);
			}
			sum += parseInt(data[x]);
		}
		rate = (tg.settings.graph_height)*0.9/sum;
		length = -(tg.settings.graph_height)*0.9/2;
		for(var x in data){
			var one_path = [];
			var o = new Object();
			o.x = real_width(std_bubble_width);
			o.y = length;
			one_path.push(o);
			o = new Object();
			o.x = real_width(std_bubble_width+std_archive_width);
			o.y = length;
			one_path.push(o);
			o = new Object();
			o.x = real_width(std_bubble_width+std_archive_width);
			o.y = length+parseInt(data[x])*rate;
			one_path.push(o);
			o = new Object();
			o.x = real_width(std_bubble_width);
			o.y = length+parseInt(data[x])*rate;
			one_path.push(o);
			o = new Object();
			o.x = real_width(std_bubble_width);
			o.y = length;
			one_path.push(o);
			path_data.set(x, one_path);

			length+=parseInt(data[x])*rate;
		}

		return path_data;
	}

	function cal_topic_river_pos(obj, last_obj, is_node, is_end){
		var new_topic = [];
		var flag=0;
		var length = 0;
		var topic_pos = [];
		var i,j;
		var river_intervel_rate;

		//判断是否是node来决定间隙的大小
		if(is_node)
			river_intervel_rate = river_intervel_rate_node[is_end];
		else
			river_intervel_rate = river_intervel_rate_half[is_end];

		//找到新的话题的名称
		for(var x in obj){
			if(tg.topic_order.indexOf(x) == -1){
				new_topic.push(x);
				if(!tg.topic_color.has(x)){
					tg.topic_color.set(x,tg.colorPoint);
					tg.colorPoint = (++tg.colorPoint)%colorTable.length;
					add_color_index_item(x);
				}
			}
		}
		//按照topic_order的顺序计算topic的偏移位置，
		//如果发现老话题则返回结果插入新话题，topic_order更新
		j=0;
		for(i=0; i<tg.topic_order.length; i++){
			if(obj[tg.topic_order[i]] == undefined){
				var o = new Object();
				o.name = new_topic[j];
				o.y = length + (1+river_intervel_rate)*value2len(obj[new_topic[j]]/2);
				j++;
				topic_pos.push(o);
				length += (2+river_intervel_rate)*value2len(obj[new_topic[j-1]]/2);
				var o = new Object();
				o.name = tg.topic_order[i];
				o.y = length + value2len(last_obj[tg.topic_order[i]]/2);
				topic_pos.push(o);
				length += (2+river_intervel_rate)*value2len(last_obj[tg.topic_order[i]]/2);
				tg.topic_order[i] = new_topic[j-1];
			}
			else {
				var o = new Object();
				o.name = tg.topic_order[i];
				o.y = length + (1+river_intervel_rate)*value2len(obj[tg.topic_order[i]]/2);
				topic_pos.push(o);
				length += (1+river_intervel_rate)*value2len(obj[tg.topic_order[i]]);
			}
		}
		//更新y值，使其中心对称
		for(var x of topic_pos){
			x.y = x.y-length/2;
		}
		return topic_pos;
	}

	function cal_topic_stack_pos(obj, last_obj){
		var new_topic = [];
		var flag=0;
		var length = 0;
		var topic_pos = [];
		var i,j;
		//找到新的话题的名称
		for(var x in obj){
			if(tg.topic_order.indexOf(x) == -1){
				new_topic.push(x);
				if(!tg.topic_color.has(x)){
					tg.topic_color.set(x,tg.colorPoint);
					tg.colorPoint = (++tg.colorPoint)%colorTable.length;
					add_color_index_item(x);
				}
			}
		}
		//按照topic_order的顺序计算topic的偏移位置，
		//如果发现老话题则返回结果插入新话题，topic_order更新
		j=0;
		for(i=0; i<tg.topic_order.length; i++){
			if(obj[tg.topic_order[i]] == undefined){
				var o = new Object();
				o.name = new_topic[j];
				o.y = length + value2len(obj[new_topic[j]]/2);
				j++;
				topic_pos.push(o);
				length += value2len(obj[new_topic[j-1]]);
				var o = new Object();
				o.name = tg.topic_order[i];
				o.y = length + value2len(last_obj[tg.topic_order[i]]/2);
				topic_pos.push(o);
				length += value2len(last_obj[tg.topic_order[i]]);
				tg.topic_order[i] = new_topic[j-1];
			}
			else {
				var o = new Object();
				o.name = tg.topic_order[i];
				o.y = length + value2len(obj[tg.topic_order[i]]/2);
				topic_pos.push(o);
				length += value2len(obj[tg.topic_order[i]]);
			}
		}
		//更新y值，使其中心对称
		for(var x of topic_pos){
			x.y = x.y-length/2;
		}
		return topic_pos;
	}

	function get_new_curve_start_y(x1,y1,x2,y2,x0){
		var y0,y3;
		var x2_x0_2, x1_x0_2, x1_x0_x2_x0;
		x2_x0_2 = Math.pow(x2-x0,2);
		x1_x0_2 = Math.pow(x1-x0,2);
		x1_x0_x2_x0 = 2*(x1-x0)*(x2-x0);
		if(x1 < x0)
			y0 = (x2_x0_2*y1-(x1_x0_2+x1_x0_x2_x0)*y2)/(x2_x0_2-x1_x0_2-x1_x0_x2_x0);
		else
			y0 = (x2_x0_2*y1-(x1_x0_2-x1_x0_x2_x0)*y2)/(x2_x0_2-x1_x0_2+x1_x0_x2_x0);
		y3 = 2*y0 - y2;
		return y3;
	}

	function get_curve_y(x1,y1,x2,y2,x){
		if(2*x<x1+x2){
			return 2*(y2-y1)*Math.pow((x-x1)/(x2-x1),2)+y1;
		}
		else{
			return 2*(y1-y2)*Math.pow((x-x2)/(x2-x1),2)+y2;
		}
	}

	function gen_path_by_curve(x1,y1,x2,y2,i1,j1,i2,j2,offset,name,id){
		var i,k;
		var w;
		var gy;
		var iter,start,end;
		var path = [];
		var length_for_diff;
		//避免出现间隙
		x1 = x1 - 0.2;
		if(id == 'river'){
			length_for_diff = tg.fix_data.river[0].length-1;
		}
		else{
			length_for_diff = tg.fix_data.stack[0].length-1;
		}
		if(j1 == length_for_diff || (id == 'river' && i2 == 0 && i1 == 2)){
			iter = i2;
			start = 0;
			end = j2;
		}
		else{
			iter = i2;
			start = j1;
			end = j2;
		}
		for(i=start; i<=end; i++){
			k = i - start;
			gy = get_curve_y(x1,y1,x2,y2,x1+k*(x2-x1)/(end-start));
			if(id == 'river')
				w = value2len(tg.fix_data.river[iter][i][name]);
			else
				w = value2len(tg.fix_data.stack[iter][i][name]);
			if(isNaN(w)){
				if(id == 'river')
					w = value2len(tg.fix_data.river[iter][i-1][name]);
				else
					w = value2len(tg.fix_data.stack[iter][i-1][name]);
			}
			if(offset[i] != undefined && offset[k]>(gy-w/2)){
				if(0 == k){
					var o = new Object();
					o.x = x1;
					o.y = offset[k]+w;
					path[0] = o;
				}
				var o = new Object();
				o.x = x1+k*(x2-x1)/(end-start);
				o.y = offset[k];
				path[k+1] = o;
				var o = new Object();
				o.x = x1+k*(x2-x1)/(end-start);
				o.y = offset[k]+w;
				path[(end-start+1)*2-k] = o;
				offset[k] = offset[k]+w;
			}
			else{
				if(0 == k){
					var o = new Object();
					o.x = x1;
					o.y = gy+w/2;
					path[0] = o;
				}
				var o = new Object();
				o.x = x1+k*(x2-x1)/(end-start);
				o.y = gy-w/2;
				path[k+1] = o;
				var o = new Object();
				o.x = x1+k*(x2-x1)/(end-start);
				o.y = gy+w/2;
				path[(end-start+1)*2-k] = o;
				offset[k] = gy+w/2;
			}
		}
		draw_path(path,name,id);
		return offset;
	}

	function gen_path_by_offset(x1,x2,i1,j1,i2,j2,offset,name,id){
		var i,k;
		var w;
		var iter,start,end;
		var path = [];
		//避免出现间隙
		x1 = x1 - 0.2;
		if(j1 == tg.fix_data.stack[0].length-1){
			iter = i2;
			start = 0;
			end = j2;
		}
		else{
			iter = i2;
			start = j1;
			end = j2;
		}
		for(i=start; i<=end; i++){
			k = i - start;
			w = value2len(tg.fix_data.stack[iter][i][name]);
			if(0 == k){
				var o = new Object();
				o.x = x1;
				o.y = offset[k]+w;
				path[0] = o;
			}
			var o = new Object();
			o.x = x1+k*(x2-x1)/(end-start);
			o.y = offset[k];
			path[k+1] = o;
			var o = new Object();
			o.x = x1+k*(x2-x1)/(end-start);
			o.y = offset[k]+w;
			path[(end-start+1)*2-k] = o;
			offset[k] = offset[k]+w;
		}
		draw_path(path,name,id);
		return offset;
	}

	function draw_river_path(topic_left,topic_right,id){
		var i,j,k;
		var offset = [];
		var iter;
		
		i=j=0;
		while(i<topic_left.topic.length && j<topic_right.topic.length){
			//如果两边命名相同，则在两个节点之间绘制河流
			if(topic_left.topic[i].name == topic_right.topic[j].name){
				// var w;
				// if(id == "river")
				// 	w = tg.fix_data.river[topic_right.i][topic_left.j][topic_left.topic[i].name];
				// else if(id == "stack_to_river" || (id=="river" &&  topic_left.j==0 && topic_left.i==0 ))
				// 	w = tg.fix_data.stack[topic_left.i][topic_left.j][topic_left.topic[i].name];
				// if(isNaN(w)){  }
				// else{
					//按照curve绘制
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i].y,
						topic_right.x,
						topic_right.topic[j].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i].name,
						id
					);
				// }
				i++;
				j++;
			}
			//如果两边命名不相同，则判断哪一边不需要绘制
			else{
				var w_left, w_right;
				if(id == "river"){
					if(topic_left.i == 2 && topic_right.i ==0){
						w_left = tg.fix_data.stack[topic_left.i][topic_left.j][topic_left.topic[i].name];
						w_right = tg.fix_data.stack[topic_left.i][topic_left.j][topic_right.topic[j].name];
					}
					else{
						w_left = tg.fix_data.river[topic_left.i][topic_left.j][topic_left.topic[i].name];
						w_right = tg.fix_data.river[topic_left.i][topic_left.j][topic_right.topic[j].name];
					}
				}
				else if(id == "stack_to_river"){
					w_left = tg.fix_data.stack[topic_left.i][topic_left.j][topic_left.topic[i].name];
					w_right = tg.fix_data.stack[topic_left.i][topic_left.j][topic_right.topic[j].name];
				}
				//右端跳过一个新话题
				if(j+1<topic_right.topic.length 
					&& topic_left.topic[i].name==topic_right.topic[j+1].name
					&& !isNaN(w_left)){
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i].y,
						topic_right.x,
						topic_right.topic[j+1].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i].name,
						id
					);
					i++;
					j+=2;
				}
				//左端跳过一个旧话题
				else if(i+1<topic_left.topic.length 
					&& topic_left.topic[i+1].name==topic_right.topic[j].name
					&& !isNaN(w_right)){
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i+1].y,
						topic_right.x,
						topic_right.topic[j].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i+1].name,
						id
					);
					i+=2;
					j++;
				}
				//两边都跳过话题
				else if(j+1<topic_right.topic.length && i+1<topic_left.topic.length
					&& topic_left.topic[i+1].name==topic_right.topic[j+1].name){
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i+1].y,
						topic_right.x,
						topic_right.topic[j+1].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i+1].name,
						id
					);
					i+=2;
					j+=2;
				}
				else{
					console.log("error");
					break;
				}
			}
		}
	}

	function draw_stack_path(topic_left,topic_right,id){
		var i,j,k;
		var if_has_bottom = false; //判断是否堆积在下层河流之上
		var offset = [];
		var iter;
		

		i=j=0;
		while(i<topic_left.topic.length && j<topic_right.topic.length){
			//如果两边命名相同
			if(topic_left.topic[i].name == topic_right.topic[j].name){
				var w = tg.fix_data.stack[topic_left.i][topic_left.j][topic_left.topic[i].name];
				if(isNaN(w)){ if_has_bottom = false; }
				else{
					//如果没有底则按照curve绘制
					if(false == if_has_bottom){
						offset = gen_path_by_curve(
							topic_left.x,
							topic_left.topic[i].y,
							topic_right.x,
							topic_right.topic[j].y,
							topic_left.i,
							topic_left.j,
							topic_right.i,
							topic_right.j,
							offset,
							topic_left.topic[i].name,
							id
						);
						if_has_bottom = true;
					}
					//否则按照stack绘制
					else{
						offset = gen_path_by_offset(
							topic_left.x,
							topic_right.x,
							topic_left.i,
							topic_left.j,
							topic_right.i,
							topic_right.j,
							offset,
							topic_left.topic[i].name,
							id
						)
						if_has_bottom = true;
					}
				}
				i++;
				j++;
			}
			//如果两边命名不相同，则判断哪一边不需要绘制
			else{
				var w_left, w_right;
				w_left = tg.fix_data.stack[topic_left.i][topic_left.j][topic_left.topic[i].name];
				w_right = tg.fix_data.stack[topic_left.i][topic_left.j][topic_right.topic[j].name];
				//右端跳过一个新话题
				if(j+1<topic_right.topic.length 
					&& topic_left.topic[i].name==topic_right.topic[j+1].name
					&& !isNaN(w_left)){
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i].y,
						topic_right.x,
						topic_right.topic[j+1].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i].name,
						id
					);
					i++;
					j+=2;
					if_has_bottom = true;
				}
				//左端跳过一个旧话题
				else if(i+1<topic_left.topic.length 
					&& topic_left.topic[i+1].name==topic_right.topic[j].name
					&& !isNaN(w_right)){
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i+1].y,
						topic_right.x,
						topic_right.topic[j].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i+1].name,
						id
					);
					i+=2;
					j++;
					if_has_bottom = true;
				}
				//两边都跳过话题
				else if(j+1<topic_right.topic.length && i+1<topic_left.topic.length
					&& topic_left.topic[i+1].name==topic_right.topic[j+1].name){
					offset = gen_path_by_curve(
						topic_left.x,
						topic_left.topic[i+1].y,
						topic_right.x,
						topic_right.topic[j+1].y,
						topic_left.i,
						topic_left.j,
						topic_right.i,
						topic_right.j,
						offset,
						topic_left.topic[i+1].name,
						id
					);
					i+=2;
					j+=2;
					if_has_bottom = true;
				}
				else{
					console.log("error");
					break;
				}
			}
		}
	}

	function draw_streaming_path(left_x, left_y, right_x, right_y, left_len, right_len, name, id){
		var path = [];
		var o = new Object();
		left_x = left_x - 0.3;
		o.x = left_x;
		o.y = left_y+left_len/2;
		path.push(o);
		o = new Object();
		o.x = right_x;
		o.y = right_y+right_len/2;
		path.push(o);
		o = new Object();
		o.x = right_x;
		o.y = right_y-right_len/2;
		path.push(o);
		o = new Object();
		o.x = left_x;
		o.y = left_y-left_len/2;
		path.push(o);
		draw_path(path,name,id);
		return;
	}

	function mouseenter(class_name){
		d3.selectAll("."+class_name)
			.style({'fill-opacity':0.3});

		d3.select("#comment")
			.select("text")
			.text(tg.settings.comment_name+": "+class_name)
	}

	function mouseleave(class_name){
		if(tg.clicked_name == class_name)
			return
		d3.selectAll("."+class_name)
			.style({'fill-opacity':1});
	}

	function onclick(class_name){
			
		if(class_name == tg.clicked_name){
			tg.clicked_name = '';

			mouseleave(class_name);
		}
		else{
			if(tg.clicked_name != ""){
				d3.selectAll("."+tg.clicked_name)
					.style({'fill-opacity':1});
			}
			tg.clicked_name = class_name;
			mouseenter(class_name);
		}
	}

	function draw_path(path, name, id){
		var line = d3.svg.line()
			.x(function(t){return t.x;})
			.y(function(t){return (tg.settings.graph_height+2*tg.settings.text_height)/2-t.y;})
			.interpolate("linear");
		tg.svg.select("#"+id)
			.append("g")
			.attr("class",id+"_inner")
			.append("path")
			.data([path])
			.attr("class",name)
			.attr("d",line)
			.style({'fill':function(d){return colorTable[tg.topic_color.get(name)]}})
			.on("mouseenter",function(){
		  		mouseenter(name)})
			.on("mouseleave",function(){
				mouseleave(name)})
			.on("click",function(){
				onclick(name)});
	}

	function create_cut_off_line(){
		var w = std_bubble_width;
		tg.cut_off_pos = [];
		tg.svg.append("g")
			.attr("id","cut_off")
			.append("g")
			.attr("id","cut_off_line");
		tg.cut_off_pos.push(real_width(w));
		w += std_archive_width;
		tg.cut_off_pos.push(real_width(w));
		for(var i=0; i<3; i++){
			w += std_per_stack_width;
			tg.cut_off_pos.push(real_width(w));
		}
		for(var i=0; i<3; i++){
			w += std_per_river_width;
			tg.cut_off_pos.push(real_width(w));
		}
		for(var i=0; i<tg.cut_off_pos.length; i++){
			d3.select("#cut_off_line")
			.append("line")
			.attr("x1",tg.cut_off_pos[i])
			.attr("y1",tg.settings.text_height)
			.attr("x2",tg.cut_off_pos[i])
			.attr("y2",real_height(std_height)+tg.settings.text_height)
			.style({"stroke":"rgb(150,150,150)"});
		}
	}

	function create_comment_area(){
		var w = std_bubble_width;
		tg.svg.append("g")
			.attr("id","comment")
			.append("text")
			.attr("x",real_width(w))
			.attr("y",tg.settings.text_height+tg.settings.graph_height+tg.settings.comment_height-5)
			.style({
				"font-size": "15px"
			})
			.text(tg.settings.comment_name+": ")
	}

	function add_color_index_item(x){
		var item = d3.select("#color_index")
			.append("g")
			.attr("class","color_index_item");
		item.append("circle")
			.data([x])
			.attr("cx",circle_radius)
			.attr("cy",tg.color_index_area_y)
			.attr("r",circle_radius)
			.attr("fill",colorTable[tg.topic_color.get(x)])
			.attr("fill-opacity","none")
			.attr("class",x)
			.on("mouseenter",function(d){mouseenter(d)})
			.on("mouseleave",function(d){mouseleave(d)})
			.on("click",function(d){onclick(d)});
		item.append("text")
			.attr("x",3*circle_radius)
			.attr("y",tg.color_index_area_y+circle_radius)
			.style({"font-size":"11px"})
			.text(x);
		tg.color_index_area_y += tg.color_index_area_y_inc;
	}

	function create_color_index_area(){
		tg.color_index_area_y = tg.settings.text_height+2*circle_radius;
		tg.color_index_area_y_inc = 15;
		tg.svg.append("g")
			.attr("id","color_index");
	}

	this.add_cut_off_text = function(arr){
		var that = this;
		d3.select("#cut_off")
			.append("g")
			.attr("id","cut_off_text")
			.selectAll("text")
			.data(arr)
			.enter()
			.append("text")
			.attr("y",tg.settings.text_height-2)
			.attr("fill","black")
			.attr("transform", function(d,i){
				return "rotate(-60 "+that.cut_off_pos[i]+","+tg.settings.text_height+")";
			})
			.attr("x",function(d,i){
				return that.cut_off_pos[i];
			})
			.style({
				"font-size": "10px"
			})
			.text(
				function(d){
					return d;
				}
			)
	}

	this.create = function(settings){
		this.settings = settings;
		tg.svg = d3.select("#"+this.settings.father_id)
			 .append("svg")
			 .attr("width",this.settings.graph_width)
			 .attr("height",this.settings.graph_height+tg.settings.text_height+tg.settings.comment_height);
		var that = this;
		return {
			init: function(data){
				that.fix_data = data;
				create_color_index_area();
				create_topic_river();
				create_comment_area();
			}
		}
	}

	this.addToken = function(token){
		if(streaming_token_num == 0){
			streaming_accumulate = new Array();
			streaming_topic_start_y = new Map();
			streaming_topic_end_y= new Map();
			streaming_last_y = new Map();
			streaming_per_width = real_width(std_streaming_width/tg.settings.river_data_num);

			var end_y = -std_height/2 + std_streaming_vertical_intervel
			var delta_y = (-2*end_y)/(tg.settings.topic_count-1)
			var river_data_length = tg.fix_data.river[2].length;
			streaming_accumulate.push(tg.fix_data.river[2][river_data_length-1])
			for(var i=0; i<tg.topic_order.length; i++){
				var name = tg.topic_order[i];
				var topic_pos_last = tg.topic_pos_last.topic;
				for(var j=0; j<topic_pos_last.length; j++){
					if(topic_pos_last[j].name == name){
						streaming_topic_start_y.set(name, topic_pos_last[j].y);
						streaming_last_y.set(name, topic_pos_last[j].y);
						break;
					}
				}
				streaming_topic_end_y.set(name, real_height(end_y));
				end_y+=delta_y;
			}
		}
		streaming_accumulate.push(token);
		streaming_token_num++;
		gen_streaming_path(token);
	}

	this.print = function(){
		//console.log(this.fix_data);
	}
};

var tg = new topic_river();