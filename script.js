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
	});
	$(document).on("contextmenu", ".background", function(e){
	   return false;
	});
	$(document).on("contextmenu", ".counter", function(e){
		toggleCounter($(this));
	   return false;
	});
	$('.background').mousemove(function(e){
		mousex = e.clientX-$('.background').offset().left;
		mousey = e.clientY-$('.background').offset().top;
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
};
function clearPlaced()
{
	$('.counter').remove();
	updatePlaced();
}
function savePlaced()
{
	var str = window.location.href.split('?')[0];
	var arr = [];
	for (i in placed)
	{
		arr.push(placed[i][0]+placed[i][3]+'='+placed[i][1]+'/'+placed[i][2]);
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
			var location = params[i][1].split('/');
			var ally = params[i][0].split('+')[1];			
			addCounter(champion,location[0],location[1],false,ally);
		}
	}
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
		});
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