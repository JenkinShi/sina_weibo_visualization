# sina_weibo_visualization

这个项目是浙江大学srtp训练计划下的一个可视化项目，由巫英才老师指导，主要成员包括应辉，李哲宇，施正阳。这个项目的主要目的在于将新浪微博的热门话题的热度信息以可视化的方式呈现出来。为了实现话题河流的效果，我们专门写了一个topic_river.js的库用来实现我们想要的河流图的效果。当然，你也可以用这个库来来实现其它相同类型数据的可视化。接下来是关于这个库的基本介绍。

# 基本功能
+ 分块河流图显示
+ 分块大小拖动调整
+ 流数据进入堆叠动画
+ 河流积压流动效果
+ 点击河流分段展示细节（包括折线图，字云）
+ 支持从外部导入需要点击事件

# 调用接口
## tg.create(settings).init(init_data);
> 初始创建河流图，传入参数包括settings（初始配置），init_data（初始数据）

> settings的格式如下：

> <pre> var settings = {
			has_detail_graph:true,	//是否展示细节图
			graph_height:300,		    //河流图区域的高度
			graph_width:1250,		    //河流图区域的宽度
			text_height:90,			    //标签区域的高度
			comment_height:30,	  	//简评区域的高度
			detail_graph_height:260,//细节图区域的高度
			topic_count:10,		    	//同一时间点展示的话题的数量
			per_river_data_num:21,	//每段河流的数据的个数
			archive_data_num:6,	   	//archive区域数据个数
			max_sum_data:8000000,	  //河流图同一时间点下数据值总和的最大值
			max_data:1200000,		    //单个数据的最大值
			ball_move_time:600,	  	//小球移动所需的时间
			ball_small_time:400,  	//小球缩小所需的时间
			comment_name:"话题名称",//简评区的标题
			father_id:"topic_river" //河流图父节点的id
		}; </pre>
		
> init_data的格式如下:

> <pre> var init_data = {
			archive:data['archive_data'],	
			river:data['river_data'],
			river_time:data['river_time'],
			archive_time:data['archive_time']
		} </pre>
		
## tg.addFuncOnClickEvent(onClickEvent);
> 增减发生鼠标点击事件后调用的函数。

> 调用函数的格式如下：

> <pre> function onClickEvent(name,time_start,time_end) </pre>

> 其中，name表示被点击区域的河流图的名称，time_start表示该区域开始的时间节点，time_end表示该区域结束的时间节点

## tg.add_word_cloud(word_cloud);
> 传入字云数据生成字云

## tg.addToken(token_data);
> 传入流数据，生成小球动画并积压。

### 以上具体细节可以参考river_topic.html示例页面

# 示例页面介绍
本示例主要由一下文件组成：
+ topic_river.html  	//河流图主页面
+ connectDB.php		//连接数据库
+ initdata.php		//获取初始数据
+ tokendata.php		//获取流数据
+ weibocontent.php	//获取微博内容的页面
+ wordclouddata.php	//获取字云数据

# 项目所用到的库
+ jQuery.js
+ d3.js
+ d3.layout.cloud.js
