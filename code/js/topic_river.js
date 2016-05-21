document.write("<script src='.\/js\/d3.min.js'><\/script>");
document.write("<script src='.\/js\/jquery.min.js'><\/script>");
document.write("<script src='.\/js\/d3.layout.cloud.js'><\/script>");
document.write("<style type='text/css'>.axis path,.axis line {fill: none;stroke: black;shape-rendering: crispEdges;}.axis text {font-family: sans-serif;font-size: 11px;}</style>");

function topic_river(){
	const colorTable = ['#C0C0C0','#F0C0F0','#E3CF57','#FF6103','#B0E0E6',
					'#D2691E','#00C957','#808069','#FFC0CB','#3D59AB',
					'#8A2BE2','#7CFC00','#FF8000','#03A89E','#FF4500',
					'#de9c53','#823635','#89bebe','#c51f1f','#113f3d'];
	var rate_bubble_pos_x = 0.05;
	var rate_archive_pos_x = 0.06;
	var rate_river_pos_x = [0.06,0.12,0.18,0.24,0.36,0.48,0.60];
	var intervel_rate = [0,0,0,0.3,0.4,0.4,0.5];
	var topic_pos_y = new Array();
	var topic_order = new Array();
	var rate_streaming_pos_x = 0.85;
	var stream_text_pos_x = 0.9
	var rate_streaming_vertical_intervel = 0.05;

	var cut_off_pos_x = new Array();
	var topic_color = new Map();
	var colorPoint = 0;
	var streaming_topic_end_y;
	var data_accumulate;
	var time_accumulate;
	var streaming_token_num = 0;
	var stream_move_times = 50;
	var archive_data;
	var tail_data_num = 10;
	var tail_rate = 3;
	var new_ball = false;

	var xScale_left, xScale_right;
	var yScale_left, yScale_right;
	var cloud_width, cloud_height;

	var on_click_event;
	var X=new Function('x','return x*tg.settings.graph_width;');
	var Y=new Function('y','return y*tg.settings.graph_height;');
	var D=new Function('d','return d*tg.settings.graph_height/tg.settings.max_sum_data')
	var oevent=new Function('e','if (!e) e = window.event;return e');

	function mouseenter(class_name){
		if(tg.clicked_name == class_name)
			return

		d3.selectAll("."+class_name)
			.style({'fill-opacity':0.3});

		d3.select("#comment")
			.select("text")
			.text(tg.settings.comment_name+": "+class_name)
	}

	function mouseleave(class_name){
		if(tg.clicked_name == class_name){
			return
		}
		d3.selectAll("."+class_name)
			.style({'fill-opacity':1});
		d3.select("#comment")
			.select("text")
			.text(tg.settings.comment_name+": "+tg.clicked_name)
	}

	function onclick(class_name, iter){
		if(class_name == tg.clicked_name && tg.clicked_iter == iter){
			tg.clicked_name = '';
			tg.clicked_iter = -1;
			mouseleave(class_name);
			$("#left_graph .line").remove();
			$("#left_graph circle").remove();
			$("#cloud_graph").empty();
			tg.svg.select("#left_graph")
				.on("mouseenter", function(){})
				.on("mouseleave", function(){})
				.on("mousemove", function(){});
		}
		else{
			if(tg.clicked_name != ""){
				d3.selectAll("."+tg.clicked_name)
					.style({'fill-opacity':1});
			}
			d3.selectAll("."+class_name)
				.style({'fill-opacity':1});
			tg.clicked_name = class_name;
			tg.clicked_iter = iter;
			d3.select("#river")
				.select(".section"+iter)
				.select("."+tg.clicked_name)
				.style({'fill-opacity':0.3});

			change_detail_graph(class_name, iter);
		}
		on_click_event(class_name,tg.fix_data.river_time[iter][0],tg.fix_data.river_time[iter][tg.settings.per_river_data_num-2]);
	}

	function change_detail_graph(class_name, iter){
		var left_graph = tg.svg.select("#left_graph");
		// var right_graph = tg.svg.select("#right_graph");


		var xBar_left = left_graph.select(".axis");
		// var xBar_right = right_graph.select(".axis");
			
		xBar_left.select(".tick_left")
			.text(tg.fix_data.river_time[iter][0]);

		xBar_left.select(".tick_right")
			.text(tg.fix_data.river_time[iter][tg.settings.per_river_data_num-2]);

		// xBar_right.select(".tick_left")
		// 	.text(tg.fix_data.river_time[iter][0]);

		// xBar_right.select(".tick_right")
		// 	.text(tg.fix_data.river_time[iter][tg.settings.per_river_data_num-2]);


		var line_left = d3.svg.line()
			.interpolate("step-after")
			.x(function(d,i){return xScale_left(i)})
			.y(function(d){return yScale_left(d)});

		var dataset = new Array();

		for(var i=0; i<tg.settings.per_river_data_num-1; i++){
			dataset.push(tg.fix_data.river[iter][i][class_name]);
		}

		$("#left_graph .line").remove();
		$("#left_graph circle").remove();
		// $("#right_graph #stack").remove();

		var h = tg.settings.graph_height+tg.settings.text_height+tg.settings.comment_height+tg.settings.detail_graph_height;

		var path_left = left_graph.append("path")
			.attr("class","line")
			.attr("d",line_left(dataset))
			.style("fill","#F00")
			.style("fill","none")
			.style("stroke-width",3)
			.style("stroke",colorTable[topic_color.get(class_name)])
			.style("stroke-opacity",0.5);

		left_graph.on("mouseenter", function(){
				if(new_ball == false){
					var xy = d3.mouse(tg.svg[0][0]);
					left_graph.append("line")
						.attr("class","guide_line")
						.attr("x1",xy[0])
						.attr("y1",h - tg.settings.detail_graph_height + 20)
						.attr("x2",xy[0])
						.attr("y2",h - 15)
						.style({"stroke":"rgb(150,150,150)"});
				}
			})
			.on("mouseleave", function(){
				$("#left_graph .guide_line").remove();
				$("#left_graph circle").remove()
				circle_mouseleave();
				new_ball = false;
			})
			.on("mousemove", function(){
				var xy = d3.mouse(tg.svg[0][0]);
				var min_delta_x = 5;
				var x = xy[0];
				var if_in = 0;
				new_ball = false;
				circle_mouseleave();
				$("#left_graph circle").remove()
				for(var i=0; i<dataset.length; i++){
					if(Math.abs(xScale_left(i)-xy[0])<min_delta_x){
						var value = tg.fix_data.river[iter][i][class_name];
						var time = tg.fix_data.river_time[iter][i];
						x = xScale_left(i);
						circle_mouseover(x,xy[1],value,time);
						left_graph.append("circle")
							.attr("cx", x)
							.attr("cy", yScale_left(value))
							.attr("r",5)
							.attr("fill",colorTable[topic_color.get(class_name)]);
						new_ball = true;
					}
				}
				left_graph.select(".guide_line")
					.attr("x1",x)
					.attr("x2",x);
			});

		// var layers = new Array();

		// for(var i=0; i<tg.settings.per_river_data_num-1; i++){
		// 	layers.push({
		// 		"x":i,
		// 		"y":parseInt(tg.fix_data.river[iter][i][class_name])
		// 	});
		// }
		// var stack = d3.layout.stack().offset("wiggle").values(function(d){return d;});
		// var area = d3.svg.area()
		// 	.x(function(d) {return xScale_right(d.x);})
		// 	.y0(function(d) {return yScale_right(d.y0)-(yScale_right(d.y0+d.y/2) - (h-tg.settings.detail_graph_height/2));})
		// 	.y1(function(d) {return yScale_right(d.y0+d.y)-(yScale_right(d.y0+d.y/2) - (h-tg.settings.detail_graph_height/2));});

		// right_graph.append("g")
		// 	.attr("id","stack")
		// 	.selectAll("path")
		// 	.data(stack([layers]))
		// 	.enter()
		// 	.append("path")
		// 	.attr("d",area)
		// 	.attr("fill",colorTable[topic_color.get(class_name)])
		// 	.style("fill-opacity",0.9);

		// right_graph.on("mouseenter", function(){
		// 		var xy = d3.mouse(tg.svg[0][0]);
		// 		right_graph.append("line")
		// 			.attr("class","guide_line")
		// 			.attr("x1",xy[0])
		// 			.attr("y1",h - tg.settings.detail_graph_height + 20)
		// 			.attr("x2",xy[0])
		// 			.attr("y2",h - 15)
		// 			.style({"stroke":"rgb(150,150,150)"});
		// 	})
		// 	.on("mouseleave", function(){
		// 		$("#right_graph .guide_line").remove();
		// 		circle_mouseleave();
		// 	})
		// 	.on("mousemove", function(){
		// 		var xy = d3.mouse(tg.svg[0][0]);
		// 		var min_delta_x = 5;
		// 		var x = xy[0];
		// 		var if_in = 0;
		// 		circle_mouseleave();
		// 		for(var i=0; i<dataset.length; i++){
		// 			if(Math.abs(xScale_right(i)-xy[0])<min_delta_x){
		// 				var value = tg.fix_data.river[iter][i][class_name];
		// 				var time = tg.fix_data.river_time[iter][i];
		// 				x = xScale_right(i);
		// 				circle_mouseover(x,xy[1],value,time);
		// 			}
		// 		}
		// 		right_graph.select(".guide_line")
		// 			.attr("x1",x)
		// 			.attr("x2",x);
		// 	});

	}

	function circle_mouseover(x,y,value,time){
		var padding = 10;
		var w = 120;
		var h = 40;
		var x1 = x+padding;
		var x2 = x+padding+w;
		var y1 = y-padding-h;
		var y2 = y-padding;

		var g = tg.svg.select("#detail_graph").append("g").attr("id","tag_board");
		g.append("rect")
			.attr("x",x1)
			.attr("y",y1)
			.attr("width",w)
			.attr("height",h)
			.style("fill","#fff")
			.style("stroke-width",1)
			.style("stroke","#c7c7c7");

		g.append("text")
			.attr("x",x1+10)
			.attr("y",y1+18)
			.style("font-size","11px")
			.text("Time: "+time);

		g.append("text")
			.attr("x",x1+10)
			.attr("y",y1+33)
			.style("font-size","11px")
			.text("Value: "+value);
	}

	function circle_mouseleave(){
		$("#tag_board").remove();
	}

	function Move_cut_off(num){
		var x,y;
		var obj = "cut_off_"+num;
		var path;
		document.getElementById(obj).onmousedown=function(e){
			drag_=true;
			with(this){
				style.position="absolute";
				var temp1=offsetLeft;
				//var temp2=offsetTop;
				var old_x = cut_off_pos_x[num];
				var x0 = cut_off_pos_x[num-1];
				var x1;
				var x2 = cut_off_pos_x[num+1];
				x=oevent(e).clientX;y=oevent(e).clientY;
				document.onmousemove=function(e){
					if(!drag_)return false;
					with(this){
						var delta_x = oevent(e).clientX-x;
						x1 = old_x + delta_x;
						if(x1>x0+5 && x1<x2-5){
							style.left=temp1+delta_x+"px";
							cut_off_pos_x[num]=x1;
							change_cut_off_pos_x(num);

							if(num != 2){
								path=cal_river_path(
									cut_off_pos_x[num-2],
									x0,
									topic_pos_y[num-3],
									topic_pos_y[num-2], 
									tg.fix_data.river[num-3],
									topic_order[num-3],
									topic_order[num-4],
									topic_order[num-2],
									cut_off_pos_x[num-2]-cut_off_pos_x[num-3],
									cut_off_pos_x[num]-cut_off_pos_x[num-1]
								);
								for(var xx of path){
									change_path(xx[1],xx[0],"river",num-3);
								}
							}
							if(num == 6){
								path = cal_stream_tail(
									topic_order[topic_order.length-2],
									topic_order[topic_order.length-1],
									tg.fix_data.river[tg.fix_data.river.length-1][tg.settings.per_river_data_num-1]);

								for(var xx of path){
									change_path(xx[1],xx[0],"river",7);
								}
							}
							else{
								path=cal_river_path(
									cut_off_pos_x[num+1],
									cut_off_pos_x[num+2],
									topic_pos_y[num],
									topic_pos_y[num+1], 
									tg.fix_data.river[num],
									topic_order[num],
									topic_order[num-1],
									topic_order[num+1],
									cut_off_pos_x[num+1]-cut_off_pos_x[num],
									cut_off_pos_x[num+3]-cut_off_pos_x[num+1]
								);
								for(var xx of path){
									change_path(xx[1],xx[0],"river",num);
								}
							}
							path=cal_river_path(
								x0,
								x1,
								topic_pos_y[num-2],
								topic_pos_y[num-1], 
								tg.fix_data.river[num-2],
								topic_order[num-2],
								topic_order[num-3],
								topic_order[num-1],
								cut_off_pos_x[num-1]-cut_off_pos_x[num-2],
								cut_off_pos_x[num+1]-cut_off_pos_x[num]
							);
							for(var xx of path){
								change_path(xx[1],xx[0],"river",num-2);
							}
							path=cal_river_path(
								x1,
								x2,
								topic_pos_y[num-1],
								topic_pos_y[num], 
								tg.fix_data.river[num-1],
								topic_order[num-1],
								topic_order[num-2],
								topic_order[num],
								cut_off_pos_x[num]-cut_off_pos_x[num-1],
								cut_off_pos_x[num+2]-cut_off_pos_x[num+1]
							);
							for(var xx of path){
								change_path(xx[1],xx[0],"river",num-1);
							}
						}
					}
				}
			}
			document.onmouseup=new Function("drag_=false");
		}
	}

	function change_path(path, name, id, iter){
		var line = d3.svg.line()
			.x(function(t){return t.x;})
			.y(function(t){return (tg.settings.graph_height+2*tg.settings.text_height)/2-t.y;})
			.interpolate("linear");
		tg.svg.select("#"+id)
			.selectAll(".section"+iter)
			.select("."+name)
			.data([path])
			.attr("d",line);
	}

	function change_path_with_delay(path, name, id, iter){
		var line = d3.svg.line()
			.x(function(t){return t.x;})
			.y(function(t){return (tg.settings.graph_height+2*tg.settings.text_height)/2-t.y;})
			.interpolate("linear");
		tg.svg.select("#"+id)
			.selectAll(".section"+iter)
			.select("."+name)
			.data([path])
			.transition()
			.duration(1000)
			.attr("d",line);
	}

	function change_cut_off_pos_x(num){
		var x = cut_off_pos_x[num];
		d3.select("#cut_off_line")
			.select(".cut_off_"+num)
			.attr("x1",x)
			.attr("x2",x);
		d3.select("#cut_off_text")
			.select(".cut_off_"+num)
			.attr("x",x)
			.attr("transform", "rotate(-60 "+x+","+tg.settings.text_height+")");
	}

	function add_cut_off_text(){
		var cut_off_text = new Array();
		cut_off_text.push(tg.fix_data.archive_time[0]);
		cut_off_text.push(tg.fix_data.river_time[0][0]);
		for(var i=0; i<tg.fix_data.river_time.length; i++){
			cut_off_text.push(tg.fix_data.river_time[i][tg.settings.per_river_data_num-1]);
		}
		d3.select("#cut_off_text")
			.selectAll("text")
			.data(cut_off_text)
			.text(
				function(d){
					return d;
				}
			);
	}

	function create_cut_off(){
		var svg_offsetLeft = document.getElementById("topic_river").offsetLeft;
		var svg_offsetTop = document.getElementById("topic_river").offsetTop;
		tg.svg.append("g")
			.attr("id","cut_off")
			.append("g")
			.attr("id","cut_off_line");
		d3.select("#cut_off")
			.append("g")
			.attr("id","cut_off_text");
		d3.select("#"+tg.settings.father_id)
			.append("g")
			.attr("id","cut_off_drag_bar");

		cut_off_pos_x[0]=X(rate_bubble_pos_x);
		for(var i=0; i<rate_river_pos_x.length; i++){
			cut_off_pos_x[i+1]=X(rate_river_pos_x[i]);
		}
		for(var i=0; i<rate_river_pos_x.length+1; i++){
			var x = cut_off_pos_x[i];
			d3.select("#cut_off_line")
				.append("line")
				.attr("class","cut_off_"+i)
				.attr("x1",x)
				.attr("y1",tg.settings.text_height)
				.attr("x2",x)
				.attr("y2",tg.settings.text_height+tg.settings.graph_height)
				.style({"stroke":"rgb(150,150,150)"});
			d3.select("#cut_off_text")
				.append("text")
				.attr("class","cut_off_"+i)
				.attr("x",x)
				.attr("y",tg.settings.text_height)
				.attr("fill","black")
				.attr("transform", "rotate(-60 "+x+","+tg.settings.text_height+")")
				.style({
					"font-size": "10px"
				});
			if(i>1&& i<rate_river_pos_x.length){
				d3.select("#cut_off_drag_bar")
					.append("div")
					.data([i])
					.attr("id","cut_off_"+i)
					.style({"position":"absolute",
						"left":x+svg_offsetLeft-3+"px",
						"top":tg.settings.text_height+svg_offsetTop+"px",
						"width":6+"px","height":12+"px",
						"background-color":"Gray"})
					.on("mouseover",function(d){ Move_cut_off(d); });
			}
		}
		add_cut_off_text();
	}

	function cal_topic_pos_y(obj, last_obj, iter){
		var new_topic = [];
		var flag=0;
		var length = 0;
		var topic_pos_y = new Map();
		var i,j;
		var intervel = intervel_rate[iter];
		
		//如果还未初始化，则初始化topic_order
		if(topic_order.length == 0){
			topic_order[iter] = new Array();
			for(var x in obj){
				topic_order[iter].push(x);
				if(!topic_color.has(x)){
					topic_color.set(x,colorPoint);
					colorPoint = (++colorPoint)%colorTable.length;
				}
			}
		}
		else{
			if(iter != 0){
				topic_order[iter] = new Array();
				for(i=0; i<topic_order[iter-1].length; i++){
					topic_order[iter].push(topic_order[iter-1][i]);
				}
			}
		}
		//找到新的话题的名称
		for(var x in obj){
			if(topic_order[iter].indexOf(x) == -1){
				new_topic.push(x);
				if(!topic_color.has(x)){
					topic_color.set(x,colorPoint);
					colorPoint = (++colorPoint)%colorTable.length;
				}
			}
		}
		
		//按照topic_order的顺序计算topic的偏移位置，
		//如果发现老话题则返回结果插入新话题，topic_order更新
		j=0;
		for(i=0; i<topic_order[iter].length; i++){
			if(obj[topic_order[iter][i]] == undefined){
				topic_pos_y.set(new_topic[j],length + (1+intervel)*D(obj[new_topic[j]]/2));
				j++;
				length += (2+intervel)*D(obj[new_topic[j-1]])/2;
				topic_pos_y.set(topic_order[iter][i],length + D(last_obj[topic_order[iter][i]]/2));
				length += (2+intervel)*D(last_obj[topic_order[iter][i]])/2;
				topic_order[iter][i] = new_topic[j-1];
			}
			else {
				topic_pos_y.set(topic_order[iter][i],length + (1+intervel)*D(obj[topic_order[iter][i]]/2));
				length += (1+intervel)*D(obj[topic_order[iter][i]]);
			}
		}
		//更新y值，使其中心对称
		for(var x of topic_pos_y){
			topic_pos_y.set(x[0],x[1]-length/2);
		}
		return topic_pos_y;
	}

	function cal_stream_path(x0,x1,x2,topic_y_1,topic_y_2, data, topic_order){
		var path_data = new Map();
		var path;
		var i,j,k;
		var offset = [];
		var name;
		var y1,y2;
		var x,y;
		var tmp;

		for(i=0; i<topic_order.length; i++){
			name = topic_order[i];
			y1 = topic_y_1.get(name);
			y2 = topic_y_2.get(name);
			path = new Array();
			for(j = 0; j<data.length; j++){
				x = x1 + j*(x0-x1)/(data.length-1)
				y = get_curve_y(x1,y1,x2,y2,x);
				if(isNaN(data[j][name])){
					tmp = data[j-1][name];
				}
				else{
					tmp = data[j][name];
				}
				path[j]={'x':x,'y':y+D(tmp)/2};
				path[data.length*2-1-j] = {'x':x,'y':y-D(tmp)/2};
			}
			path_data.set(name, path);
		}

		return path_data;
	}


	function cal_river_path(x1,x2,topic_y_1,topic_y_2, data, topic_order, topic_order_last, topic_order_next,l_left,l_right){
		var path_data = new Map();
		var path;
		var i,j,k;
		var offset = [];
		var name;
		var y1,y2;
		var x,y;
		var tmp;
		var ifDrawLeft = 0;
		var ifDrawRight = 0;
		var pathLength;

		for(i=0; i<topic_order.length; i++){
			name = topic_order[i];
			y1 = topic_y_1.get(name);
			y2 = topic_y_2.get(name);
			path = new Array();
			if(topic_order_last != undefined){
				if(topic_order_last.indexOf(name) == -1){
					ifDrawLeft = 1;
				}
			}
			if(topic_order_next.indexOf(name) == -1){
				ifDrawRight = 1;
			}
			for(j = 0; j<data.length; j++){
				x = x1 + j*(x2-x1)/(data.length-1)
				y = get_curve_y(x1,y1,x2,y2,x);
				if(isNaN(data[j][name])){
					tmp = data[j-1][name];
				}
				else{
					tmp = data[j][name];
				}
				path[j]={'x':x,'y':y+D(tmp)/2};
				path[(data.length+ifDrawRight*tail_data_num)*2-1-j] = {'x':x,'y':y-D(tmp)/2};
			}
			var tx1 = x2;
			var tx2 = tail_rate * D(data[data.length-2][name]);
			var ty1 = D(data[data.length-2][name])/2;
			var ty2 = 0;
			if(tx2 > l_right/2){
				tx2 = tx1 + l_right/2;
			}
			else{
				tx2 = tx1 + tx2;
			}
			for(j = 0; j<ifDrawRight*tail_data_num; j++){
				x = tx1 + (j+1)*(tx2-tx1)/tail_data_num;
				y = get_curve_y(tx1,ty1,tx2,ty2,x);
				path[data.length+j] = {'x':x,'y':y+y2};
				path[data.length+tail_data_num*2-1-j] = {'x':x,'y':y2-y};
			}
			var tx1 = x1;
			var tx2 = tail_rate * D(data[0][name]);
			var ty1 = D(data[0][name])/2;
			var ty2 = 0;
			if(tx2 > l_left/2){
				tx2 = tx1 - l_left/2;
			}
			else{
				tx2 = tx1 - tx2;
			}
			for(j = 0; j<ifDrawLeft*tail_data_num; j++){
				x = tx1 + (j+1)*(tx2-tx1)/tail_data_num;
				y = get_curve_y(tx2,ty2,tx1,ty1,x);
				path[(data.length+ifDrawRight*tail_data_num)*2+j] = {'x':x,'y':y1-y};
				path[(data.length+ifDrawRight*tail_data_num+tail_data_num)*2-1-j] = {'x':x,'y':y1+y};
			}
			path_data.set(name, path);
			ifDrawLeft = ifDrawRight = 0;
		}

		return path_data;
	}

	function get_curve_y(x1,y1,x2,y2,x){
		if(2*x<x1+x2){
			return 2*(y2-y1)*Math.pow((x-x1)/(x2-x1),2)+y1;
		}
		else{
			return 2*(y1-y2)*Math.pow((x-x2)/(x2-x1),2)+y2;
		}
	}

	function cal_stream_tail(old_topic_order, new_topic_order, data){
		var path_data = new Map();
		var l_left = cut_off_pos_x[cut_off_pos_x.length-1] - cut_off_pos_x[cut_off_pos_x.length-2];
		var topic_pos = topic_pos_y[topic_pos_y.length-1];

		for(var i=0; i<new_topic_order.length; i++){
			var name = new_topic_order[i];
			var y1 = topic_pos.get(name)
			if(old_topic_order.indexOf(name) == -1){
				var path = new Array();
				var tx1 = cut_off_pos_x[cut_off_pos_x.length-1];
				var tx2 = tail_rate * D(data[name]);
				var ty1 = D(data[name])/2;
				var ty2 = 0;
				if(tx2 > l_left/2){
					tx2 = tx1 - l_left/2;
				}
				else{
					tx2 = tx1 - tx2;
				}
				for(j = 0; j<tail_data_num; j++){
					x = tx1 + j*(tx2-tx1)/(tail_data_num-1);
					y = get_curve_y(tx2,ty2,tx1,ty1,x);
					path[j] = {'x':x,'y':y1-y};
					path[tail_data_num*2-1-j] = {'x':x,'y':y1+y};
				}
				path_data.set(name, path);
			}
		}
		return path_data;
	}

	function create_stream_tail(){
		var path_data = cal_stream_tail(
			topic_order[topic_order.length-2],
			topic_order[topic_order.length-1],
			tg.fix_data.river[tg.fix_data.river.length-1][tg.settings.per_river_data_num-1]);

		var id = "river";
		var j=0;
		for(var x of path_data){
			if(j == 0){
				create_path(x[1],x[0],id,7,true);
				j=1;
			}
			else{
				create_path(x[1],x[0],id,7,false);
			}
		}
	}

	function create_river_path(){
		var data;
		var path_data;
		var id = 'river';
		tg.svg.append("g").attr("id",id);
		topic_pos_y.push(cal_topic_pos_y(tg.fix_data.river[0][0],{},0));
		for(var i=0; i<rate_river_pos_x.length-1; i++){
			topic_pos_y.push(
				cal_topic_pos_y(tg.fix_data.river[i][tg.settings.per_river_data_num-1], 
					tg.fix_data.river[i][tg.settings.per_river_data_num-2],
					i+1
				)
			);
			path_data = cal_river_path(
				X(rate_river_pos_x[i]),
				X(rate_river_pos_x[i+1]),
				topic_pos_y[i],
				topic_pos_y[i+1],
				tg.fix_data.river[i],
				topic_order[i],
				topic_order[i-1],
				topic_order[i+1],
				cut_off_pos_x[i+1]-cut_off_pos_x[i],
				cut_off_pos_x[i+3]-cut_off_pos_x[i+2]
			);
			var j = 0;
			for(var x of path_data){
				if(j == 0){
					create_path(x[1],x[0],id,i,true);
					j=1;
				}
				else{
					create_path(x[1],x[0],id,i,false);
				}
			}
		}
	}

	function replace_path(path, new_name, old_name, id, iter){
		var line = d3.svg.line()
			.x(function(t){return t.x;})
			.y(function(t){return (tg.settings.graph_height+2*tg.settings.text_height)/2-t.y;})
			.interpolate("linear");

		tg.svg.select("#"+id)
			.select("."+"section"+iter)
			.select("."+old_name)
			.on("mouseenter",function(){
		  		mouseenter(new_name)})
			.on("mouseleave",function(){
				mouseleave(new_name)})
			.on("click",function(){
				onclick(new_name, iter)})
			.data([path])
			.transition()
			.attr("class",new_name)
			.attr("d",line)
			.style({'fill':function(d){return colorTable[topic_color.get(new_name)]}});	
	}

	function create_path(path, name, id, iter, isFirst){
		var line = d3.svg.line()
			.x(function(t){return t.x;})
			.y(function(t){return (tg.settings.graph_height+2*tg.settings.text_height)/2-t.y;})
			.interpolate("linear");
		if(isFirst){
			tg.svg.select("#"+id)
				.append("g")
				.attr("class","section"+iter)
				.append("path")
				.data([path])
				.attr("class",name)
				.attr("d",line)
				.style({'fill':function(d){return colorTable[topic_color.get(name)]}})
				.on("mouseenter",function(){
			  		mouseenter(name)})
				.on("mouseleave",function(){
					mouseleave(name)})
				.on("click",function(){
					onclick(name, iter)});
		}
		else{
			tg.svg.select("#"+id)
				.select("."+"section"+iter)
				.append("path")
				.data([path])
				.attr("class",name)
				.attr("d",line)
				.style({'fill':function(d){return colorTable[topic_color.get(name)]}})
				.on("mouseenter",function(){
			  		mouseenter(name)})
				.on("mouseleave",function(){
					mouseleave(name)})
				.on("click",function(){
					onclick(name, iter)});
		}
	}

	function cal_archive_path(data){
		var i,j;
		var sum = 0;
		var length;
		var rate;
		var path_data = new Map();

		for(var x of data){
			if(!topic_color.has(x[0])){
				topic_color.set(x[0],colorPoint);
				colorPoint = (colorPoint+1)%colorTable.length;
			}
			sum += x[1];
		}
		rate = (tg.settings.graph_height)*0.9/sum;
		length = -(tg.settings.graph_height)*0.9/2;
		for(var x of data){
			var one_path = [];
			var o = new Object();
			o.x = X(rate_bubble_pos_x);
			o.y = length;
			one_path.push(o);
			o = new Object();
			o.x = X(rate_archive_pos_x);
			o.y = length;
			one_path.push(o);
			o = new Object();
			o.x = X(rate_archive_pos_x);
			o.y = length+x[1]*rate;
			one_path.push(o);
			o = new Object();
			o.x = X(rate_bubble_pos_x);
			o.y = length+x[1]*rate;
			one_path.push(o);
			path_data.set(x[0], one_path);
			length+=x[1]*rate;
		}

		return path_data;
	}

	function create_archive_path(){
		var id = "archive";
		var path_data;
		archive_data = new Map();
		tg.svg.append("g").attr("id",id);
		for(var i=0; i<tg.settings.archive_data_num; i++){
			var d = tg.fix_data.archive[i];
			for(var x in d){
				if(archive_data.has(x)){
					archive_data.set(x,parseInt(archive_data.get(x))+d[x]);
				}
				else{
					archive_data.set(x,parseInt(d[x]));
				}
			}
		}
		path_data = cal_archive_path(archive_data);
		var j=0;
		for(var x of path_data){
			if(j==0){
				create_path(x[1],x[0],id,0,true);
				j=1;
			}
			else{
				create_path(x[1],x[0],id,0,false);
			}
		}
	}

	function create_comment_area(){
		var w = X(rate_bubble_pos_x);
		tg.svg.append("g")
			.attr("id","comment")
			.append("text")
			.attr("x",w)
			.attr("y",tg.settings.text_height+tg.settings.graph_height+tg.settings.comment_height-5)
			.style({
				"font-size": "15px"
			})
			.text(tg.settings.comment_name+": ")
	}

	function create_stream(){
		d3.select("#river")
			.append("g")
			.attr("class","section6");
	}

	function create_stream_text(){
		tg.svg.append("g").attr("id","stream_text");
	}

	function create_topic_river(){
		create_cut_off();
		create_archive_path();
		create_river_path();
		create_stream_tail();
		create_stream();
		create_comment_area();
		create_stream_text();
	}

	function create_detail_graph(){
		var padding = 20;
		var detail_graph = tg.svg.append("g").attr("id","detail_graph");
		var x1 = X(rate_bubble_pos_x)+30;
		var x4 = X(rate_river_pos_x[rate_river_pos_x.length-1]);
		var x2 = (x1+x4)/2 - 3*padding;
		var x3 = (x1+x4)/2 - 2*padding;
		var h = tg.settings.graph_height+tg.settings.text_height+tg.settings.comment_height+tg.settings.detail_graph_height;

		var left_graph = detail_graph.append("g").attr("id","left_graph");
		// var right_graph = detail_graph.append("g").attr("id","right_graph");

		left_graph.append("rect")
			.attr("x",x1)
			.attr("y",h - tg.settings.detail_graph_height)
			.attr("width",x2-x1)
			.attr("height",tg.settings.detail_graph_height)
			.style("fill","#fff");

		// right_graph.append("rect")
		// 	.attr("x",x3)
		// 	.attr("y",h - tg.settings.detail_graph_height)
		// 	.attr("width",x4-x3)
		// 	.attr("height",tg.settings.detail_graph_height)
		// 	.style("fill","#fff");

		xScale_left = d3.scale
			.linear()
			.domain([0,tg.settings.per_river_data_num-2])
			.range([x1,x2]);

		// xScale_right = d3.scale
		// 	.linear()
		// 	.domain([0,tg.settings.per_river_data_num-2])
		// 	.range([x3,x4]);

		var xAxis_left = d3.svg.axis()
			.scale(xScale_left)
			.orient("bottom")
			.ticks(0);

		// var xAxis_right = d3.svg.axis()
		// 	.scale(xScale_right)
		// 	.orient("bottom")
		// 	.ticks(0);

		var xBar_left = left_graph.append("g")
			.attr("class","axis")
			.attr("transform", "translate(0"+","+(h-padding)+")")
			.call(xAxis_left);
			
		xBar_left.append("text")
			.attr("class","tick_left")
			.attr("x",x1)
			.attr("y",16)
			.style("text-anchor","middle")
			.text(tg.fix_data.river_time[0][0]);

		xBar_left.append("text")
			.attr("class","tick_right")
			.attr("x",x2)
			.attr("y",16)
			.style("text-anchor","middle")
			.text(tg.fix_data.river_time[0][tg.settings.per_river_data_num-2]);

		// var xBar_right = right_graph.append("g")
		// 	.attr("class","axis")
		// 	.attr("transform", "translate(0"+","+(h-padding)+")")
		// 	.call(xAxis_right);

		// xBar_right.append("text")
		// 	.attr("class","tick_left")
		// 	.attr("x",x3)
		// 	.attr("y",16)
		// 	.style("text-anchor","middle")
		// 	.text(tg.fix_data.river_time[0][0]);

		// xBar_right.append("text")
		// 	.attr("class","tick_right")
		// 	.attr("x",x4)
		// 	.attr("y",16)
		// 	.style("text-anchor","middle")
		// 	.text(tg.fix_data.river_time[0][tg.settings.per_river_data_num-2]);

		yScale_left = d3.scale.linear()
			.domain([0,tg.settings.max_data])
			.range([h-padding,h-tg.settings.detail_graph_height+padding]);

		// yScale_right = d3.scale.linear()
		// 	.domain([0,tg.settings.max_data*2])
		// 	.range([h-padding,h-tg.settings.detail_graph_height+padding]);

		var yAxis_left = d3.svg.axis()
			.scale(yScale_left)
			.orient("left").ticks(10);

		// var yAxis_right = d3.svg.axis()
		// 	.scale(yScale_right)
		// 	.orient("left").ticks(0);

		var yBar_left = left_graph.append("g")
			.attr("class","axis")
			.attr("transform","translate("+x1+",0)")
			.call(yAxis_left);

		// var yBar_right = right_graph.append("g")
		// 	.attr("class","axis")
		// 	.attr("transform","translate("+x3+",0)")
		// 	.call(yAxis_right);
			
		//word cloud
		cloud_width = x4-x3;
		cloud_height = tg.settings.detail_graph_height;
		var cloud_graph = tg.svg
			.select("#detail_graph")
			.append("g")
			.attr("id","cloud_graph")
			.attr("transform", "translate("+(x3+cloud_width/2)+","+(h-tg.settings.detail_graph_height+cloud_height/2)+")");
	}

	function draw_ball(isFirst,x0,x1,x2,topic_y_1,topic_y_2,obj,topic,intervel){
		var g_ball;
		var y;
		var i,j,k;
		if(isFirst){
			g_ball = tg.svg
				.append("g")
				.attr("id","ball");
		}
		else{
			g_ball = tg.svg.select("#ball");
		}
		for(i=0; i<topic.length; i++){
			var name = topic[i];
			g_ball.append("circle")
				.attr("class",name)
				.attr("cx",x2)
				.attr("cy",(tg.settings.graph_height+2*tg.settings.text_height)/2-topic_y_2.get(name))
				.attr("r",D(obj[name])/2)
				.attr('fill',colorTable[topic_color.get(name)]);
		}
		k=0;
		for(var i=1; i<stream_move_times/2; i++){
			setTimeout(function(){
					for(var j=0; j<topic.length; j++){
						var name = topic[j];
						var x = x0+D(obj[name]/2)+(x2-x0-D(obj[name]/2))*(stream_move_times/2-k-2)/(stream_move_times/2-1);
						var y = get_curve_y(
							x1,
							topic_y_1.get(name),
							x2,
							topic_y_2.get(name),
							x
						);
						g_ball.select("."+name)
							.attr("cx",x)
							.attr("cy",(tg.settings.graph_height+2*tg.settings.text_height)/2-y);
					}
					k++;
				}, i*intervel
			);
		}
	}

	function move_river(){
		//archive partion
		var new_archive_data = new Map(archive_data);
		var archive_shifted = tg.fix_data.archive.shift();
		var river_sum = new Object();
		var archive_pop = new Array();
		var path_data;

		for(var i=0; i<tg.settings.per_river_data_num-1; i++){
			if(i==0){
				for(var x in tg.fix_data.river[0][i]){
					river_sum[x]=parseInt(tg.fix_data.river[0][i][x]);
				}
			}
			else{
				for(var x in river_sum){
					river_sum[x]+=parseInt(tg.fix_data.river[0][i][x]);
				}
			}
		}
		tg.fix_data.archive.push(river_sum);
		for(var x in river_sum){
			if(new_archive_data.has(x)){
				new_archive_data.set(x,new_archive_data.get(x)+river_sum[x]);
			}
			else{
				new_archive_data.set(x,river_sum[x]);
			}
		}
		for(var x in archive_shifted){
			if(archive_shifted[x] == new_archive_data.get(x)){
				new_archive_data.delete(x);
				archive_pop.push(x);
			}
			else{
				new_archive_data.set(x,new_archive_data.get(x)-archive_shifted[x]);
			}
		}
		for(var i = 0; i<archive_pop.length; i++){
			var name = archive_pop[i];
			$("#archive ."+name).remove();
		}
		path_data = cal_archive_path(new_archive_data);
		for(var x of new_archive_data){
			if(archive_data.has(x[0])){
				change_path_with_delay(path_data.get(x[0]),x[0],"archive",0);
			}
			else{
				create_path(path_data.get(x[0]),x[0],"archive",0,false)
			}
		}
		archive_data = new_archive_data;
		//river partion
		var old_topic_order = topic_order.slice(0);
		
		tg.fix_data.river.shift();
		tg.fix_data.river.push(data_accumulate);
		topic_order = new Array();
		topic_order[0] = old_topic_order[1].slice(0);
		topic_pos_y[0] = cal_topic_pos_y(tg.fix_data.river[0][0],{},0);
		for(var i=0; i<topic_pos_y.length-1; i++){
			topic_pos_y[i+1] = cal_topic_pos_y(
				tg.fix_data.river[i][tg.settings.per_river_data_num-1], 
				tg.fix_data.river[i][tg.settings.per_river_data_num-2],
				i+1
			);
			path_data = cal_river_path(
				cut_off_pos_x[i+1],
				cut_off_pos_x[i+2],
				topic_pos_y[i],
				topic_pos_y[i+1],
				tg.fix_data.river[i],
				topic_order[i],
				topic_order[i-1],
				topic_order[i+1],
				cut_off_pos_x[i+1]-cut_off_pos_x[i],
				cut_off_pos_x[i+3]-cut_off_pos_x[i+2]
			);
			var j = 0;
			var old_topic = old_topic_order[i];
			var new_topic = old_topic_order[i+1];
			for(var j=0; j<new_topic.length; j++){
				var old_name = old_topic[j];
				var new_name = new_topic[j];
				replace_path(path_data.get(new_name),new_name,old_name,"river",i);
			}
		}
	}

	this.create = function(settings){
		tg.settings = settings;
		tg.clicked_name = "";
		tg.svg = d3.select("#"+tg.settings.father_id)
			 .append("svg")
			 .attr("width",tg.settings.graph_width)
			 .attr("height",tg.settings.graph_height+tg.settings.text_height+tg.settings.comment_height+tg.settings.detail_graph_height);
		return {
			init: function(data){
				tg.fix_data = data;
				create_topic_river();
				if(tg.settings.has_detail_graph){
					create_detail_graph();
				}
			}
		}
	}

	this.addFuncOnClickEvent = function(Func){
		on_click_event = Func;
	}

	this.addToken = function(obj){
		var this_time = obj['time'];
		var obj = obj['data'];
		var g_ball;
		var y;
		var i,j,k,l;
		var intervel_move = parseInt(tg.settings.ball_move_time/stream_move_times);
		var intervel_small = parseInt(tg.settings.ball_small_time/stream_move_times);
		var id="river";
		var x0_before,x0_after,x1,x2,x3,topic_y_1,topic_y_2;
		var topic = topic_order[topic_order.length-1];
		var path_data;

		x1 = X(rate_river_pos_x[rate_river_pos_x.length-1]);
		x0_before = x1 + (X(rate_streaming_pos_x)-x1)*streaming_token_num/(tg.settings.per_river_data_num-1);
		x0_after = x1 + (X(rate_streaming_pos_x)-x1)*(streaming_token_num+1)/(tg.settings.per_river_data_num-1);
		x2 = X(rate_streaming_pos_x);
		x3 = X(stream_text_pos_x);
		if(streaming_token_num == 0){
			data_accumulate = new Array();
			time_accumulate = new Array();
			streaming_topic_end_y= new Map();

			var end_y = Y(-1/2 + rate_streaming_vertical_intervel)
			var delta_y = (-2*end_y)/(tg.settings.topic_count-1)
			var i = tg.fix_data.river.length-1;
			var j = tg.fix_data.river[i].length-1;
			data_accumulate.push(tg.fix_data.river[i][j]);
			time_accumulate.push(tg.fix_data.river_time[i][j]);
			for(j=0; j<topic.length; j++){
				var name = topic[j];
				tg.svg.select("#stream_text")
					.append("text")
					.attr("class",name)
					.attr("x",x3)
					.attr("y",(tg.settings.graph_height+2*tg.settings.text_height)/2-end_y)
					.style({"font-size":"13px"})
					.text(name); 
				streaming_topic_end_y.set(name, end_y);
				end_y+=delta_y;
			}
		}

		topic_y_1 = topic_pos_y[topic_pos_y.length-1];
		topic_y_2 = streaming_topic_end_y;

		data_accumulate.push(obj);
		time_accumulate.push(this_time);
		streaming_token_num++;

		if(streaming_token_num >= tg.settings.per_river_data_num-1){
			streaming_token_num = 0;
			$("#stream_text").empty();
			$("#river .section6").empty();
			move_river();
			$("#river .section7").remove();
			create_stream_tail();
			tg.fix_data.archive_time.shift();
			tg.fix_data.archive_time.push(tg.fix_data.river_time[0][tg.settings.per_river_data_num-1])
			tg.fix_data.river_time.shift();
			tg.fix_data.river_time.push(time_accumulate);

			add_cut_off_text();
			return;
		}

		path_data = cal_stream_path(x0_after,x1,x2,topic_y_1,topic_y_2,data_accumulate,topic);


		if($("#ball").length == 0){
			g_ball = tg.svg
				.append("g")
				.attr("id","ball");
		}
		else{
			g_ball = tg.svg.select("#ball");
		}
		for(i=0; i<topic.length; i++){
			var name = topic[i];
			g_ball.append("circle")
				.attr("class",name)
				.attr("cx",x3)
				.attr("cy",(tg.settings.graph_height+2*tg.settings.text_height)/2-topic_y_2.get(name))
				.attr("r",D(obj[name])/2)
				.attr('fill',colorTable[topic_color.get(name)]);
		}
		k=0;
		
		for(i=0; i<stream_move_times; i++){
			setTimeout(function(){
				for(var j=0; j<topic.length; j++){
					var name = topic[j];
					var x = x0_before+D(obj[name]/2)+(x3-x0_before-D(obj[name]/2))*(stream_move_times-k-1)/(stream_move_times);
					var y = topic_y_2.get(name);
					if(x < x2){
						y = get_curve_y(
							x1,
							topic_y_1.get(name),
							x2,
							streaming_topic_end_y.get(name),
							x
						);
					}
					g_ball.select("."+name)
						.attr("cx",x)
						.attr("cy",(tg.settings.graph_height+2*tg.settings.text_height)/2-y)
						.style({"font-size": "10px"});
				}
				k++;
				if(k == stream_move_times){
					l=0;
					for(i=0; i<stream_move_times; i++){
						setTimeout(function(){
							for(var j=0; j<topic.length; j++){
								var name = topic[j];
								var r = D(obj[name]/2)/(l/10+1);
								var x = x0_before+r;
								g_ball.select("."+name)
									.attr("cx",x)
									.attr("r",r);
							}
							l++;
							if(l == stream_move_times){
								if(streaming_token_num == 1){
									for(var x of path_data){
										create_path(x[1],x[0],id,6,false);
									}
								}
								else{
									for(var x of path_data){
										change_path(x[1],x[0],id,6,false);
									}
								}
								$("#ball").empty();
								
							}
						}, i*intervel_small);
					}
				}
			}, i*intervel_move);
		}
	}

	this.add_word_cloud = function(words_cloud){
		var max_fre = words_cloud.reduce(function(a,b){
			if(a.size>b.size)
				return a;
			else
				return b;
		});
		var min_fre = words_cloud.reduce(function(a,b){
			if(a.size<b.size)
				return a;
			else
				return b;
		});

		var wordScale = d3.scale
			.linear()
			.domain([min_fre.size,max_fre.size])
			.range([20,70]);

		d3.layout.cloud().size([cloud_width, cloud_height])
			//map 返回新的object数组
			.words(words_cloud)
			//~~的作用是单纯的去掉小数部分，不论正负都不会改变整数部分 
			//这里的作用是产生0 1 
			.rotate(function() { return ~~(Math.random() * 2) * 90; })
			.font("Impact")
			.fontSize(function(d) { return wordScale(d.size); })
			.on("end", function(words){
				var fill = d3.scale.category20();
				if($("#cloud_graph text").length != 0){
					$("#cloud_graph").empty();
				}
				tg.svg.select("#cloud_graph")
					.selectAll("text")
					.data(words)
					.enter().append("text")
					.style("border","1px solid blue")
					.style("font-size", function(d) { return d.size + "px"; })
					.style("font-family", "Impact")
					.style("fill", function(d, i) { return fill(i); })//fill 在前面15行定义为颜色集
					.attr("text-anchor", "middle")
					.attr("transform", function(d) {
					  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
					})
					.text(function(d) { return d.text; });
			})//结束时运行draw函数
			.start();
	}
}

var tg = new topic_river();