/* ========================================================================
 * buildafaq: faq_render.js v0.0.1
 * ========================================================================
 * Copyright 2014 Dave Klein
 * Licensed under Apache License 2.0 
 *              (https://github.com/drk123/buildafaq/blob/master/LICENSE)
 * ======================================================================== */

var FAQ = FAQ || {};
FAQ.TopItems = {};
FAQ.Items = {};
FAQ.ItemsByRef = {};
FAQ.ItemObjs = {};
FAQ.ItemStacks = {};
FAQ.MaxRenderDepth = 16;

FAQ.ItemIds = 0;

FAQ.AnswerManager = function()
{
   this.arrAnswers = [];
   this.eventHandlers = {};
   
   this.addEventHandler = function(name, handler)
   {
     this.eventHandlers[name] = handler;
   };

   this.dropEventHandler = function(name)
   {
     delete this.eventHandlers[name];
   };
   
   this.clear = function()
   {
     this.arrAnswers = [];
	 this.fireEvent('Clear');
   };
   
   this.addAnswer = function(item, answer)
   {
      this.arrAnswers.push({ item: item, answer: answer});
	  this.fireEvent('AddAnswer');
   };

   this.dropAnswer = function()
   {
      this.arrAnswers.pop();
	  this.fireEvent('DropAnswer');
   };
   
   this.fireEvent = function(eventName)
   {
      var eventMethod = 'on' + eventName;
	  for (var name in this.eventHandlers)
	  {
	     var handler = this.eventHandlers[name];
		 if (typeof handler[eventMethod] !== 'undefined')
		 {
		    handler[eventMethod](this.arrAnswers);
		 }
	  }
   }
   
};


FAQ.htmlEscape =function(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
};


FAQ.addQuestion = function(id, question)
{
	this.TopItems[id] = question;
	this.eval(question);
	this.Items[id].Answers = new FAQ.AnswerManager();
};

FAQ.loadQuestion = function(id)
{
};

FAQ.clearRender = function()
{
	this.TopItems = {};
	this.Items = {};
	this.ItemsByRef = {};
	this.ItemObjs = {};
	this.ItemStacks = {};
}

FAQ.renderCode = function(renderDivId, code, id)
{
	this.RenderDivId = renderDivId;
	if (typeof code !== 'undefined')
	{
	   eval(code);
	}

	var renderHTML = '';
	if (typeof id === 'undefined')
	{
		this.renderTopItems(this.TopItems);
	} else {
		var item = FAQ.Items[id];
		this.renderTopItems([ item ]);
	}

};

FAQ.renderIdCount = 0;
FAQ.nextRenderId = function()
{
   return "REND" + this.renderIdCount++;
};

FAQ.renderTopItems = function(topItems)
{
	var renderHTML = '';
	// render all the high-level stuff
	var topId = this.nextRenderId();
	var firstOne = true;
	renderHTML += '<div class="panel-group" id="' + topId + '">';
	this.TopRenderItems = {};
	for (var itemId in topItems)
	{
		var item = this.Items[itemId];
		var id = this.nextRenderId();
		var titleId = this.nextRenderId();
		var title = item.title || item.q || '+' ;
		var topItemId = this.nextRenderId();
		this.ItemStacks[topItemId] = [];
		
		renderHTML += '  <div class="panel panel-default faq_top" id="' + topItemId + '">';
		renderHTML += '    <div class="panel-heading">';
		renderHTML += '      <h4 class="panel-title">';
		renderHTML += '<a href="#" title="Go Back" class="faq_go_back" style="visibility:hidden;"><i class="fa fa-arrow-left"></i></a>&nbsp;&nbsp;';
		renderHTML += '        <a data-toggle="collapse" data-parent="#' + topId + '" href="#' + id + '" id="' + titleId + '" style="font-size: 1.1em;">';
		renderHTML += this.htmlEscape(title);
		renderHTML += '        </a>';
		renderHTML += '<span class="pull-right"><a href="#" title="Show Answers" class="faq_show_answers"><i class="fa fa-caret-down"></i></a></span>';
		renderHTML += '<span class="pull-right" style="display:none;"><a href="#" title="Hide Answers" class="faq_hide_answers"><i class="fa fa-caret-up"></i></a></span>';
		renderHTML += '      </h4>';
		renderHTML += '    </div>';
		renderHTML += '    <div id="' + id + '" class="panel-collapse collapse' + (firstOne ? ' in' : '') + '">';
		renderHTML += '      <div class="panel-body faq_panel_body">';
		
		renderHTML += '      <div class="faq_panel_prev" style="display:none;">';
		renderHTML += '      </div>';
		
		renderHTML += '      <div class="faq_panel_qbody">';
        var itemObj = this.renderItem(item, this.ItemStacks[topItemId], titleId);		
		this.TopRenderItems[titleId] = itemObj;
		itemObj.itemStack.push(itemObj);
		renderHTML += this.renderBody(itemObj);
		renderHTML += '      </div></div>';
		renderHTML += '    </div>';
		renderHTML += '  </div>';

		firstOne = false;
	}
	renderHTML += '</div>';
	$(this.RenderDivId).html(renderHTML);
	$('#' + topId + ' .faq_show_answers').click(function(e) {
	   e.preventDefault();
	   $(this).parents('.faq_top').find('.faq_panel_prev').css('display', 'inline');
	   $(this).parents('.faq_top').find('.faq_show_answers').parent().css('display', 'none');
	   $(this).parents('.faq_top').find('.faq_hide_answers').parent().css('display', 'inline');
	});
	$('#' + topId + ' .faq_hide_answers').click(function(e) {
	   e.preventDefault();
	   $(this).parents('.faq_top').find('.faq_panel_prev').css('display', 'none');
	   $(this).parents('.faq_top').find('.faq_show_answers').parent().css('display', 'inline');
	   $(this).parents('.faq_top').find('.faq_hide_answers').parent().css('display', 'none');
	});
	$('#' + topId + ' .faq_go_back').click(function(e) {
	   e.preventDefault();
	   var stackId = $(this).parents('.faq_top').attr('id');
	   FAQ.goBack(stackId);
	});
};

FAQ.goBack = function(stackId)
{
   var itemStack = this.ItemStacks[stackId];
   var childItemObj = itemStack.pop();
   var parentItemObj = itemStack.pop();
   var panelBody = $('#' + stackId + ' .faq_panel_body');
   
   if (this.ItemStacks[stackId].length === 0)
   {
		itemStack.push(parentItemObj);
		$('#' + stackId + ' .faq_go_back').css('visibility', 'hidden');
		var title = parentItemObj.title  ;
   	    var titleEl = $('#' + parentItemObj.renderId);
        titleEl.html(this.htmlEscape(title));
		var bodyHTML = this.renderBody(parentItemObj);
		panelBody.find('.faq_panel_qbody').html(bodyHTML);
   } else {
	   // remove stuff
	   var pItem = $('#' + stackId + ' .faq_panel_body .faq_panel_prev .faq_prev_item').last();
	   pItem.remove();
	   
	   // re-render
	   var grandParentItemObj = itemStack.pop();
	   itemStack.push(grandParentItemObj);
	   this.addAnswer(grandParentItemObj.renderId, parentItemObj.renderId,  $('#' + stackId + ' .faq_panel_body .faq_panel_prev'));
   }
};

FAQ.addAnswer = function(parentRenderId, childRenderId, el)
{
   var parentItemObj = this.ItemObjs[parentRenderId];
   var itemObj = this.ItemObjs[childRenderId];

   parentItemObj.itemStack.push(itemObj);
   if (parentItemObj.itemStack.length >= 2)
   {
	  el.parents('.faq_top').find('.faq_go_back').css('visibility', 'visible');
   }
   
   
   var panelBody = el.parents('.faq_panel_body');
   panelBody.find('.faq_panel_qbody').html('');
   
   var isTop = (typeof this.TopRenderItems[parentRenderId] !== 'undefined' ? true : false);
   var bodyHTML = '';
   
   if (isTop) {
   	   var titleEl = $('#' + parentItemObj.renderId);
       titleEl.html(this.htmlEscape(parentItemObj.title));
   } else {
	   if (typeof parentItemObj.title !== 'undefined' && parentItemObj.title !== '')
	   {
		  var renderHTML = '';
		  renderHTML += FAQ.renderTitle({renderId: ''}, parentItemObj, false);
		  
		  if (itemObj.isTerminal !== true)
		  {
			var panel_prev = panelBody.find('.faq_panel_prev');
			panel_prev.append(renderHTML);
		  } else {
		     bodyHTML = renderHTML;
		  }
	   }
   }
   
   if (typeof itemObj !== 'undefined' && itemObj !== null)
   {
	   if (typeof itemObj.title !== 'undefined' && itemObj.title !== '')
	   {
	        bodyHTML += FAQ.renderTitle(parentItemObj, itemObj, false);
		}
		bodyHTML += this.renderBody(itemObj);

	  panelBody.find('.faq_panel_qbody').html(bodyHTML);
   } else {
      panelBody.find('.faq_panel_qbody').html('err');
   }
}

FAQ.renderTitle = function(parentObj, childObj, linkTitle)
{
	var renderHTML = '';
    var title = childObj.title;
	if (typeof title !== 'undefined' && title !== '')
	{
		var styleBit =  ' style="margin: 2px;background:#eee;"'; // grrrr
		renderHTML += '<div class="container-fluid">';
		renderHTML += '<div class="row"><div class="col-sm-12"' + (linkTitle ? '' : styleBit) + '><h4 id="' + childObj.renderId + '">';
		if (linkTitle) renderHTML += '<a href="#" onclick="FAQ.addAnswer(\'' + parentObj.renderId + '\',\'' + childObj.renderId + '\', $(this)); return false;">' ;
		renderHTML += this.htmlEscape(childObj.title);
		if (linkTitle) renderHTML += '</a>';
		renderHTML += '</h4></div></div></div>';
	}
	
	return renderHTML;
};

FAQ.renderBody = function(itemObj, depth)
{
   if (typeof itemObj === 'undefined' || itemObj == null) return;
   if (typeof depth === 'undefined') 
   {
      depth = 0;
   }
   
   if (depth > this.MaxRenderDepth) return; // we're probably in a loop
   
   var renderHTML = '';
   if (typeof itemObj.body !== 'undefined')
   {
      renderHTML += itemObj.body;
   }
   
   if (typeof itemObj.children !== 'undefined')
   {
      var isSingle = (itemObj.children.length === 1 && depth == 0 ? true : false);
	  var doBody;
      for (var i = 0; i < itemObj.children.length; i++)
	  {
	     doBody = isSingle;
	     var child = itemObj.children[i];
		 var childObj = this.renderItem(child, itemObj.itemStack);
		 if (typeof childObj.title !== 'undefined' && childObj.title.trim() != '')
		 {
		    renderHTML += FAQ.renderTitle(itemObj, childObj, !doBody);
		 }  else {
		    doBody = true;
		 }
		 
		 if (doBody)
		 {
			 if (typeof childObj.body !== 'undefined') {
				renderHTML += childObj.body;
			 } else if (typeof childObj.children !== 'undefined') {
				for (var j = 0; j < childObj.children.length; j++)
				{
				   var grandChild = childObj.children[j];
				   var grandChildObj = this.renderItem(grandChild, itemObj.itemStack);

				   if (typeof grandChildObj.body !== 'undefined') {
						renderHTML += grandChildObj.body;
 				   } else  {
					   renderHTML += FAQ.renderTitle(childObj, grandChildObj, true);
					}
				}
			 }
		}
		 
	  }
   }
   return renderHTML;
};


FAQ.stringifySingle = function(str)
{
	var jstr = str.replace('"', '\\\"');
	var jstr = str.replace("'", '\\\'');
	return "'" + jstr + "'";
};


FAQ.renderItem = function(item, itemStack, optRenderId)
{
   var itemObj = { item : item, renderId : (typeof optRenderId === 'undefined' ? this.nextRenderId() : optRenderId), isTerminal: false, itemStack: itemStack };
   var bodyHTML = '';

	if (typeof item !== 'undefined' )
	{
	    FAQ.ItemObjs[itemObj.renderId] = itemObj;
		try {

			if (item.type === 'question') {
			    itemObj.title = item.q;
				bodyHTML += '<div class="container-fluid">';
				bodyHTML += '<div class="row">';
				bodyHTML += '  <div class="col-sm-12"><button type="button" class="btn btn-success" onclick="FAQ.addAnswer(' + item._refId + ',' + item.y._refId + 
					', $(this), ' + this.stringifySingle("YES") + ');return false;">Yes</button>';
				bodyHTML += '  <button type="button" class="btn btn-danger" onclick="FAQ.addAnswer(' + item._refId + ',' + item.n._refId + 
					', $(this),' + this.stringifySingle("NO") +'); return false;">No</button></div>';
				bodyHTML += '</div>';
				bodyHTML += '</div>';
				itemObj.body = bodyHTML;
			} else if (item.type === 'question_multiple') {
			    itemObj.title = item.title;
				itemObj.children = [];
				for (var fq = 0; fq < item.questions.length; fq++)
				{
					itemObj.children.push(item.questions[fq]) ;
				}
			} else if (item.type === 'question_single') {
			    itemObj.title = item.title;
				itemObj.children = [];
				itemObj.children.push(item.answer);
			} else if (item.type === 'question_link') {
				var qId = item.qid;
				itemObj.children = [];
				itemObj.children.push(this.followQuestionLink(qId));
			} else if (item.type === 'answer') {
			    
				bodyHTML += '<div class="container-fluid">';
				bodyHTML += '<div class="row"><div class="col-sm-12">';
				bodyHTML += item.a;
				bodyHTML += '</div></div></div>';
				itemObj.body = bodyHTML;
				itemObj.isTerminal = true;
			} else if (item.type === 'answer_question') {
				itemObj.children = [];
				for (var aq = 0; aq < item.questions.length; aq++)
				{
					itemObj.children.push(item.questions[aq]) ;
				}
			} else if (item.type === 'answer_link') {
				bodyHTML += '<div class="container-fluid">';
				bodyHTML += '<div class="row"><div class="col-sm-12">';
				bodyHTML += '<a href="' + item.url + '">';
				bodyHTML += this.htmlEscape(item.title);
				bodyHTML += '</div></div></div>';
				itemObj.body = bodyHTML;
				itemObj.isTerminal = true;
			}


		} catch (e) {
			console.log(e);
		}
	}
	return itemObj;
};

FAQ.followQuestionLink = function(id)
{
   // for now, only local links
   return this.Items[id];
};

// recursively traverse object tree starting at item
FAQ.eval = function(item, parent)
{
	if (item instanceof Array)
	{
		item.forEach(function(entry) { FAQ.eval(entry, parent) ; });
	} else {
		if (typeof item !== 'undefined')
		{
			FAQ.ItemIds++;
			FAQ.ItemsByRef[FAQ.ItemIds] = item;
			item._refId = FAQ.ItemIds;
			if (typeof parent !== 'undefined')
			{
				item._parent = parent;
			}

			if (typeof item.id !== 'undefined')
			{
				FAQ.Items[item.id] = item;
			}

			for (var child in item.eval)
			{
				FAQ.eval(item[item.eval[child]], item);
			}
		}
	}
};

