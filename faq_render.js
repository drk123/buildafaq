/* ========================================================================
 * buildafaq: faq_render.js v0.0.1
 * ========================================================================
 * Copyright 2014 Dave Klein
 * Licensed under Apache License 2.0 
 *              (https://github.com/drk123/buildafaq/blob/master/LICENSE)
 * ======================================================================== */

var FAQ = FAQ || {};

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
	FAQ.TopItems[id] = question;
	FAQ.eval(question);
};

FAQ.loadQuestion = function(id)
{
};

FAQ.clearRender = function()
{
	FAQ.TopItems = {};
	FAQ.Items = {};
	FAQ.ItemsByRef = {};
}


FAQ.TopItems = {};
FAQ.Items = {};
FAQ.ItemsByRef = {};
FAQ.MaxRenderDepth = 16;

FAQ.ItemIds = 0;

FAQ.renderIdCount = 0;
FAQ.nextRenderId = function()
{
   return "REND" + FAQ.renderIdCount++;
};

// for now, only 1 render manager
FAQ.renderCode = function(renderDivId, renderer, code, id)
{
	FAQ.RenderDivId = renderDivId;
	if (typeof code !== 'undefined')
	{
	   eval(code);
	}

	FAQ.renderManager = new FAQ.RenderManager(renderer, renderDivId);
	renderer.setRenderManager(FAQ.renderManager);
	
	if (typeof id === 'undefined')
	{
		FAQ.renderManager.renderTopItems(this.TopItems);
	} else {
		var item = FAQ.Items[id];
		FAQ.renderManager.renderTopItems([ item ]);
	}

};

FAQ.Renderer = function()
{
   this.topId = "";
   this.TopconvertItems = {};
};

FAQ.RenderIdCount = 0;
FAQ.Renderer.prototype.nextRenderId = function()
{
   return "REND" + FAQ.RenderIdCount++;
};


FAQ.Renderer.prototype.renderContainer = function(renderDivId)
{
    this.renderDivId = renderDivId;
	var renderHTML = '';

	this.topId = FAQ.nextRenderId();
	renderHTML += '<div class="panel-group" id="' + this.topId + '">';
	renderHTML += '</div>';

	$(this.renderDivId).html(renderHTML);
};

FAQ.Renderer.prototype.addTopItem = function(isExpanded)
{
   isExpanded = isExpanded || true;
   
   var topItemId = FAQ.nextRenderId();
   var id = FAQ.nextRenderId();
   var titleId = FAQ.nextRenderId();
   
   var renderHTML = '';
	renderHTML += '  <div class="panel panel-default faq_top" id="' + topItemId + '">';
	renderHTML += '    <div class="panel-heading">';
	renderHTML += '      <h4 class="panel-title">';
	renderHTML += '<a href="#" title="Go Back" class="faq_go_back" style="visibility:hidden;"><i class="fa fa-arrow-left"></i></a>&nbsp;&nbsp;';
	renderHTML += '        <a data-toggle="collapse" data-parent="#' + this.topId + '" href="#' + id + '" id="' + titleId + '" style="font-size: 1.1em;" class="faq_top_item_title">';
	renderHTML += '        </a>';
	renderHTML += '<span class="pull-right" style="display:none;"><a href="#" title="Show Answers" class="faq_show_answers"><i class="fa fa-caret-down"></i></a></span>';
	renderHTML += '<span class="pull-right"><a href="#" title="Hide Answers" class="faq_hide_answers"><i class="fa fa-caret-up"></i></a></span>';
	renderHTML += '      </h4>';
	renderHTML += '    </div>';
	renderHTML += '    <div id="' + id + '" class="panel-collapse collapse' + (isExpanded ? ' in' : '') + '">';
	renderHTML += '      <div class="panel-body faq_panel_body">';
	
	renderHTML += '      <div class="faq_panel_prev">';
	renderHTML += '      </div>';
	
	renderHTML += '      <div class="faq_panel_qbody">';
	renderHTML += '      </div></div>';
	renderHTML += '    </div>';
	renderHTML += '  </div>';
	
	$("#" + this.topId).append(renderHTML);
	
	$('#' + topItemId + ' .faq_show_answers').click(function(e) {
	   e.preventDefault();
	   $(this).parents('.faq_top').find('.faq_panel_prev').css('display', 'inline');
	   $(this).parents('.faq_top').find('.faq_show_answers').parent().css('display', 'none');
	   $(this).parents('.faq_top').find('.faq_hide_answers').parent().css('display', 'inline');
	});
	$('#' + topItemId + ' .faq_hide_answers').click(function(e) {
	   e.preventDefault();
	   $(this).parents('.faq_top').find('.faq_panel_prev').css('display', 'none');
	   $(this).parents('.faq_top').find('.faq_show_answers').parent().css('display', 'inline');
	   $(this).parents('.faq_top').find('.faq_hide_answers').parent().css('display', 'none');
	});

	var renderer = this;
	$('#' + topItemId + ' .faq_go_back').click(function(e) {
	   e.preventDefault();
	   var topItemId = $(this).parents('.faq_top').attr('id');
	   renderer.goBack(topItemId);
	});
	
	return topItemId;
};

FAQ.Renderer.prototype.setRenderManager = function(renderManager)
{
   this.renderManager = renderManager;
};

FAQ.Renderer.prototype.showBackArrow = function(topItemId, show)
{
	$('#' + topItemId + ' .faq_go_back').css('visibility', (show ? 'visible' : 'hidden'));
  
};

FAQ.Renderer.prototype.replaceAnswer=function(topItemId, html)
{
   var el = $('#' + topItemId + ' .faq_panel_qbody');
   el.html(html);
};

FAQ.Renderer.prototype.replaceTopTitle = function(topItemId, title)
{
   var el = $('#' + topItemId + ' .faq_top_item_title');
   el.html(FAQ.htmlEscape(title));
};

FAQ.Renderer.prototype.goBack = function(topItemId)
{
   this.renderManager.goBack(topItemId);
};

FAQ.Renderer.prototype.renderTitle = function(title, link)
{
	var renderHTML = '';
	if (typeof title !== 'undefined' && title !== '')
	{
		renderHTML += '<div class="container-fluid">';
		renderHTML += '<div class="row"><div class="col-sm-12"><h4>';
		if (link) renderHTML += '<a href="' + link + '">'; ;
		renderHTML += FAQ.htmlEscape(title);
		if (link) renderHTML += '</a>';
		renderHTML += '</h4></div></div></div>';
	}
	
	return renderHTML;
};

FAQ.Renderer.prototype.renderBody = function(bodyHTML)
{
   var renderHTML = '';
   if (typeof bodyHTML !== 'undefined' && bodyHTML != '')
   {
		renderHTML += '<div class="container-fluid">';
		renderHTML += '<div class="row"><div class="col-sm-12">';
		renderHTML += bodyHTML;
		renderHTML += '</div></div></div>';
   }
 
   return renderHTML;
};


FAQ.Renderer.prototype.addTitleToPrevious = function(topItemId, title)
{
   var renderHTML = '';
   title = title || '';
   if (title !== '')
   {
	  var styleBit =  ' style="margin: 2px;background:#eee;"'; // grrrr, needs to be in css
	  renderHTML += '<div class="container-fluid faq_prev_item">';
	  renderHTML += '<div class="row"><div class="col-sm-12"' +  styleBit + '><h4>';
	  renderHTML += FAQ.htmlEscape(title);
	  renderHTML += '</h4></div></div></div>';
		
  } else {
	  renderHTML += '<div class="faq_prev_item" style="display:none;"></div>';
  }
  var el = $('#' + topItemId + ' .faq_panel_body .faq_panel_prev');
  el.append(renderHTML);
};

FAQ.Renderer.prototype.dropTitleFromPrevious = function(topItemId)
{
	var pItem = $('#' + topItemId + ' .faq_panel_body .faq_panel_prev .faq_prev_item').last();
	pItem.remove();
};


FAQ.RenderManager = function(renderer, renderDiv)
{
   this.maxDepth = 16;
   this.ItemStacks = {};
   this.TopItemStacks = {};
   this.renderer = renderer;
   this.renderDiv = renderDiv;
   this.ItemObjs = {};
   this.TopItems = {};
   this.TopContainers = {};
};

FAQ.RenderManager.prototype.renderTopItems = function(topItems)
{
    this.renderer.renderContainer(this.renderDiv);
	var renderHTML = '';
	// render all the high-level stuff
	var firstOne = true;
	for (var itemId in topItems)
	{
	    var topItemId = this.renderer.addTopItem(firstOne);
	    this.TopContainers[itemId] = topItemId;
		this.ItemStacks[topItemId] = [];
		this.TopItemStacks[topItemId] = [];
		var itemObj = this.convertItem(FAQ.Items[itemId], topItemId);
		this.TopItems[itemObj.renderId] = itemObj.renderId;
		var renderHTML = this.renderItem(itemObj, 0);
		this.renderer.replaceAnswer(topItemId, renderHTML);
		firstOne = false;
	}
};

FAQ.RenderManager.prototype.goBack = function(topItemId)
{
   var itemStack = this.ItemStacks[topItemId];
   var topItemStack = this.TopItemStacks[topItemId];
   topItemStack.pop();
   var lastTopItemId = topItemStack[topItemStack.length-1].renderId;

   var off = itemStack.length-1;
   while (off >= 0 && itemStack[off].renderId !== lastTopItemId)
   {
	 var prevItemObj = itemStack.pop();
	 if (prevItemObj.inPrevStack === true)
	 {
		this.renderer.dropTitleFromPrevious(topItemId);
		prevItemObj.inPrevStack = false;
	 }
     off--;
   }
   
   prevItemObj = itemStack.pop();
   if (prevItemObj.inPrevStack === true)
   {
		this.renderer.dropTitleFromPrevious(topItemId);
		prevItemObj.inPrevStack = false;
   }
   
   var itemObj = topItemStack.pop();
   this.renderer.showBackArrow(topItemId, topItemStack.length > 0);
   var renderHTML = this.renderItem(itemObj, 0);
   this.renderer.replaceAnswer(topItemId, renderHTML);
	 
   
};

FAQ.RenderManager.prototype.addAnswer = function(renderId)
{
   var itemObj = this.ItemObjs[renderId];
   if (typeof itemObj !== 'undefined')
   {
      var topItemId = itemObj.topItemId;
      this.renderer.showBackArrow(topItemId, true);
      var itemStack = this.ItemStacks[topItemId];
      var topItemStack = this.TopItemStacks[topItemId];
	  var lastTopItemId = topItemStack[topItemStack.length-1].renderId;
	  for (var i = 0; i < itemStack.length; i++)
	  {
	     if (itemStack[i].renderId === lastTopItemId)
		 {
		    //i++;
			break;
		 }
	  }
	  
	  // add in prev stuff
	  while (i < itemStack.length)
	  {
	     var prevItemObj = itemStack[i++];
		 prevItemObj.inPrevStack = true;
		 if (!this.isTopItem(prevItemObj))
		 {
		    this.renderer.addTitleToPrevious(prevItemObj.topItemId, prevItemObj.title);
		 } else {
		    this.renderer.addTitleToPrevious(prevItemObj.topItemId, '');
		 }
	  }
	  
	  var renderHTML = this.renderItem(itemObj, 0);
	  this.renderer.replaceAnswer(topItemId, renderHTML);
   }

}


FAQ.RenderManager.prototype.renderItem = function(itemObj, depth)
{
   depth = depth || 0;
   
   if (depth > this.maxDepth) return '';
   if (typeof itemObj === 'undefined') return '';
   
   if (depth === 0)
   {
      this.TopItemStacks[itemObj.topItemId].push(itemObj);
   }
   this.ItemStacks[itemObj.topItemId].push(itemObj);
   
   var renderHTML = '';
   renderHTML += this.renderTitle(itemObj, depth);
   renderHTML += this.renderBody(itemObj, depth);
   
   
   return renderHTML;
};

FAQ.RenderManager.prototype.isTopItem = function(itemObj)
{
   var isTop = false;
   
   if (this.TopItems[itemObj.renderId])
   {
      isTop = true;
   }
   
   return isTop;
};

FAQ.RenderManager.prototype.renderTitle = function(itemObj, depth)
{
   var title = itemObj.title;
   var renderHTML = '';
   if (this.isTopItem(itemObj)) {
      title = title || '+';
	  this.renderer.replaceTopTitle(itemObj.topItemId, title);
   } else {
      renderHTML += this.renderer.renderTitle(title);
   }   
   
   return renderHTML;
};

FAQ.RenderManager.prototype.renderBody = function(itemObj, depth)
{
   var renderHTML = '';
   
   if (typeof itemObj.body !== 'undefined' && itemObj.body != '')
   {
      renderHTML += this.renderer.renderBody(itemObj.body);
   }
   
   renderHTML += this.renderChildren(itemObj, depth);
   
   return renderHTML;
};

FAQ.RenderManager.prototype.renderChildren = function(itemObj, depth)
{
   var renderHTML = '';
   
   var children = itemObj.children || [];
   if (children.length > 0)
   {
      if (children.length == 1) {
		var child = children[0];
		var childObj = this.convertItem(child, itemObj.topItemId);
	    renderHTML += this.renderItem(childObj, depth+1);
	  } else {
	     for (var i = 0; i < children.length; i++)
		 {
		    var child = children[i];
			var childObj = this.convertItem(child, itemObj.topItemId);
			var title = child.title || '';
			if (title === '') {
			   renderHTML += this.renderItem(childObj, depth+1);
			} else {
			   var theLink = "javascript:FAQ.renderManager.addAnswer('" + childObj.renderId + "');";
			   renderHTML += this.renderer.renderTitle(title, theLink);
			}
		 }
	  }
   }
   
   return renderHTML;
};

FAQ.RenderManager.prototype.convertItem = function(item, topItemId)
{
   var itemObj = { item : item, 
                   renderId :FAQ.nextRenderId(),
				   topItemId : topItemId
				 };
	if (typeof item !== 'undefined' )
	{
	    this.ItemObjs[itemObj.renderId] = itemObj;
		try {
			if (item.type === 'question_multiple') {
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
				itemObj.children.push(FAQ.followQuestionLink(qId));
			} else if (item.type === 'answer') {
				itemObj.body = item.a;
			} else if (item.type === 'answer_question') {
				itemObj.children = [];
				itemObj.useParent = true;
				for (var aq = 0; aq < item.questions.length; aq++)
				{
					itemObj.children.push(item.questions[aq]) ;
				}
			} else if (item.type === 'answer_link') {
			    var bodyHTML = '';
				bodyHTML += '<a href="' + item.url + '">';
				bodyHTML += this.htmlEscape(item.title) || '+';
				bodyHTML += '</a>';
				itemObj.body = bodyHTML;
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

