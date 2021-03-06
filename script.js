var placed = [];
var mousex=0;
var mousey=0;

var bg = new Image();
bg.src = 'center.png';
var bgw,bgh;
bg.onload = function()
{
	bgw = this.width;
	bgh = this.height;
	updateSize();
};
$(document).ready(function(){
	init();
	$('.background').mousedown(function(){
		event.preventDefault();
		if (event.which == 3)	//Right click down
		{
			startArrow();
		}
	});
	$('.background').mouseup(function(){
		if (event.which == 3)	//Right click down
		{
			endArrow();
		}
	});
	$(document).on("contextmenu", ".background", function(e){
	   return false;
	});
	$('.background').mousemove(function(e){
		mousex = e.clientX-$('.background').offset().left;
		mousey = e.clientY-$('.background').offset().top;
		updateArrow();
		if (event.which == 3)
		{
			$('.counter[halfclick=yes]').removeAttr('halfclick');
		}
	});
	$('.clear').click(clearPlaced);	
	$('.copy').click(function(){
		var copyTextarea = document.querySelector('.hiddentext');
		copyTextarea.select();
		try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
			console.log('Copying text command was ' + msg);
		} catch (err) {
			console.log('Oops, unable to copy');
		}
	})
	$('.fakecounter').mousedown(function(){
		var inner = $(this).find('.counterinner')[0];
		var champ = $(inner).attr('name');
		addCounter(champ,mousex,mousey,true);
	})
	$('.add').mouseenter(function(){		
		$('.add li').addClass('show');
	});
	$('.add').mouseleave(function(){		
		$('.add li').removeClass('show');
	});
	$('.innerList').mouseenter(function(){
		$(this).find('.open').addClass('show');
	});
	$('.innerList').mouseleave(function(){
		$(this).find('.open').removeClass('show');
	});
	setInterval(updateTracker,10);
	$('.background').mouseup(function(){
		//Check if the tracker was released over the delete area
		var x = $('.delete').offset().left -$('.background').offset().left;
		var y = $('.delete').offset().top -$('.background').offset().top;
		var right = x+$('.delete').outerWidth();
		var bot = y+$('.delete').outerHeight();
		if (mousex> x-$('.tracker').width()/2  && mousex < right+$('.tracker').width()/2  && mousey > y-$('.tracker').height()/2  && mousey < bot+$('.tracker').height()/2)
		{
			deleteTracker();
		}
		$('.tracker').removeClass('tracker');
		//Update the array of placed counters.
		updatePlaced();
		savePlaced();	
		
	});
});
var currentArrowx,currentArrowy,currentArrowHeight,currentArrowAngle;
var drawingArrow = false;
function startArrow()
{
	drawingArrow = true;
	currentArrowx = mousex;
	currentArrowy = mousey;
	currentArrowHeight = 0;
	var shaft = $('<div class="arrowshaft"><div class="arrowshaftinner"></div></div>');
	var arrowhead = $('<img class="arrowhead" src="arrowhead.png"/>');
	var arrow = $('<div class="arrow"></div>');
	arrow.addClass('currentarrow');
	arrow.addClass('hidden');
	arrow.append(shaft);
	arrow.append(arrowhead);
	arrow.css('left',currentArrowx);
	arrow.css('top',currentArrowy);	
	$('.background').append(arrow);	
}
function endArrow()
{
	drawingArrow = false;
	if (currentArrowHeight-$('.currentarrow').find('.arrowhead').height() < 10)
	{
		$('.currentarrow').remove();
	}
	$('.currentarrow').click(function(){
		$(this).remove();
	});
	$('.currentarrow').attr('angle',currentArrowAngle);
	$('.currentarrow').removeClass('currentarrow');
	updatePlaced();
	savePlaced();
}
function updateArrow()
{
	if (drawingArrow)
	{
		var dist = distanceTo(currentArrowx,currentArrowy,mousex,mousey);		
		var shaft = $('.currentarrow .arrowshaft');		
		shaft.css('height',(dist-$('.currentarrow').find('.arrowhead').height())+'px');
		currentArrowHeight = dist;
		currentArrowAngle = angleTo(currentArrowx,currentArrowy,mousex,mousey);
		$('.currentarrow').css('transform','rotate('+(currentArrowAngle-90)+'deg)');
		if (currentArrowHeight-$('.currentarrow').find('.arrowhead').height() > 10)
		{
			$('.currentarrow').removeClass('hidden');
		}
	}
}
function angleTo(x1,y1,x2,y2)
{
	var opposite = y2-y1;
	var adjacent = x2-x1;
	var angle =  Math.atan2(opposite, adjacent);
	angle = angle * (180/Math.PI);
	return angle;
}
function higher(a,b)
{
	return (a>b?a:b)
}
function lower(a,b)
{
	return (a<b?a:b);
}
function distanceTo(x1,y1,x2,y2)
{
	var a = x2 - x1;
	var b = y2 - y1;
	var c = Math.sqrt(a*a + b*b);
	return c;
}
function updatePlaced()
{
	placed = [];
	var counters = $('.counter');
	for (i=0;i<counters.length;i++)
	{
		var counter = counters[i];
		if (!$(counter).hasClass('tracker'))
		{
			var name = $(counter).attr('name');
			var x = $(counter).css('left').replace('px','');
			var y = $(counter).css('top').replace('px','');
			var allystr = '';
			if ($(counter).hasClass('ally'))
			{
				allystr = '+a';
			}
			else if ($(counter).hasClass('enemy'))
			{
				allystr = '+';
			}
			else
			{
				allystr = '';
			}

			placed.push([name,x,y,allystr]);
		}
	}
	var arrows = $('.arrow');
	for (i=0;i<arrows.length;i++)
	{
		var arrow = arrows[i];
		var x = $(arrow).css('left');
		var y = $(arrow).css('top');
		var angle = $(arrow).attr('angle');
		var height = $(arrow).css('height').replace('px','');
		placed.push(['arrow',x,y,roundToTwo(angle),height]);
	}
};
function clearPlaced()
{
	$('.counter').remove();
	$('.arrow').remove();
	updatePlaced();
}
function roundToTwo(num)
{
	return ( Math.round(num*100) / 100);
}
function savePlaced()
{
	var str = window.location.href.split('?')[0];
	var arr = [];
	for (i in placed)
	{
		if (placed[i][0] == 'arrow')
		{
			arr.push(placed[i][0]+'='+placed[i][1]+'/'+placed[i][2]+'/'+placed[i][3]+'/'+placed[i][4]);
		}
		else
		{
			arr.push(placed[i][0]+placed[i][3]+'='+placed[i][1]+'/'+placed[i][2]);
		}
	}
	arr = arr.join('&');
	str+='?'+arr;
	$('.hiddentext').val(str);
}
var stateObj = {};
function init()
{
	//Get the url parameters and place counters accordingly.
	var url = window.location.href;
	var params = url.split('?')[1];
	if (params)
	{
		params = params.split('&');
		for (i in params)
		{
			params[i] = [params[i].split('=')[0],params[i].split('=')[1]];
			var champion = params[i][0].split('+')[0];
			
			if (champion == 'arrow')		
			{
				var arr = params[i][1].split('/');
				var x = arr[0];
				var y = arr[1];
				var angle = arr[2];
				var height = arr[3];
				addArrow(x,y,angle,height);
			}
			else
			{
				var location = params[i][1].split('/');
				var ally = params[i][0].split('+')[1];	
				addCounter(champion,location[0],location[1],false,ally);
			}
		}
	}
}
function addArrow(x,y,angle,height)
{
	var shaft = $('<div class="arrowshaft"><div class="arrowshaftinner"></div></div>');
	var arrowhead = $('<img class="arrowhead" src="arrowhead.png"/>');
	var arrow = $('<div class="arrow"></div>');
	arrow.append(shaft);
	arrow.append(arrowhead);
	arrow.css('left',x);
	arrow.css('top',y);
	$(arrow).css('transform','rotate('+(angle-90)+'deg)');
	shaft.css('height',(height-$('.currentarrow').find('.arrowhead').height())+'px');
	$('.background').append(arrow);	
}
function addCounter(name,x,y,held,ally)
{
	var tracking = held?'tracker':'';
	var allystr = '';
	if (ally !== undefined)
	{
		if (ally === 'a')
		{
			allystr = 'ally';
		}
		else
		{
			allystr = 'enemy';
		}
	}
	var counter = $('<div name="'+name+'" class="'+tracking+' '+allystr+' counter hidden"><div name="'+name+'" class="counterinner"></div></div>');
	counter.css('left',x+'px');
	counter.css('top',y+'px');
	$('.background').append(counter);
	updateTracker();
	$('.counter').removeClass('hidden');
	$('.counter').mousedown(function(){
		if (event.which == 1) //Left click down
		{
			event.preventDefault();
			$(this).addClass('tracker');
		}
		else if (event.which == 3)
		{
			$(this).attr('halfclick','yes');
		}
	});
	$('.counter').mouseup(function(){
		if ($(this).attr('halfclick') && event.which == 3)
		{
			$(this).removeAttr('halfclick');
			toggleCounter($(this));
		}
	})
}
function toggleCounter(counter)
{
	if (counter.hasClass('ally'))
	{
		counter.removeClass('ally');
		counter.addClass('enemy');
	}
	else if (counter.hasClass('enemy'))
	{
		counter.removeClass('enemy');
	}
	else
	{
		counter.addClass('ally');
	}
}
function deleteTracker()
{
	$('.tracker').remove();
}
function updateTracker()
{
	//If an object is following the cursor, move it to the cursor.
	var tracker = $('.tracker');
	if (tracker.length != 0)
	{			
		tracker.css('left',mousex-tracker.width()/2);
		tracker.css('top',mousey-tracker.height()/2);
		//Check if the tracker is over the delete area
		var x = $('.delete').offset().left -$('.background').offset().left;
		var y = $('.delete').offset().top -$('.background').offset().top;
		var right = x+$('.delete').outerWidth();
		var bot = y+$('.delete').outerHeight();
		if (mousex> x-$('.tracker').width()/2  && mousex < right+$('.tracker').width()/2  && mousey > y-$('.tracker').height()/2  && mousey < bot+$('.tracker').height()/2)
		{
			$('.delete').addClass('deleteOver');
		}
		else
		{
			$('.delete').removeClass('deleteOver');	
		}
	}
	else
	{
		$('.delete').removeClass('deleteOver');
	}
}
function updateSize()
{
	$('.background').width(bgw);
	$('.background').height(bgh);
}