/* ========================================================================
 * buildafaq: faq.js v0.0.1
 * ========================================================================
 * Copyright 2014 Dave Klein
 * Licensed under Apache License 2.0 
 *              (https://github.com/drk123/buildafaq/blob/master/LICENSE)
 * ======================================================================== */
var FAQ = FAQ || {};
FAQ.BlockSelect = {};


FAQ.selectById = function(id)
{
   if (typeof FAQ.BlockSelect[id] !== 'undefined')
   {
	  FAQ.BlockSelect[id].select();
	  if (typeof this.onSelectById !== 'undefined')
	  {
	     // callback
		 this.onSelectById(id);
	  }
   }
}

FAQ.convertToHTML = function()
{
   var conversion = FAQ.convertToCode();
   var html = '';
	html += '<!DOCTYPE html>\n';
	html += '<html>\n';
	html += '<head>\n';
	html += '  <meta charset="utf-8">\n';
	html += '  <meta name="generator" value="Build-a-FAQ by Dave Klein v0.1 https://github.com/drk123/buildafaq">\n';
	html += '  <meta name="viewport" content="target-densitydpi=device-dpi, width=device-width, initial-scale=1.0, user-scalable=no">\n';
	html += '	<link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css">\n';
	html += '	<link href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">\n';
	html += '</head>\n';
	html += '<body>\n';
	html += '<div id="faq_content"></div>\n';
	html += '    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>\n';
	html += '	<script src="https://netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script>	\n';
	html += '	<script src="https://drk123.github.io/buildafaq/faq_render.js"></script>	\n';
	html += '	<script type="text/javascript">\n';
	html += '        FAQ.clearRender();\n';
	html += '        ' + conversion.code + '\n';
	html += '        FAQ.renderCode("#faq_content", new FAQ.Renderer());\n';
	html += '	</script>\n';
	html += '</body>\n';
	conversion.code = html;
	
	return conversion;
   
}




FAQ.convertToCode = function()
{
   FAQ.DepthCount = 0;
   FAQ.Errors = [];
   FAQ.Ids = {};
   FAQ.DuplicateIds = {};
   var code = Blockly.JavaScript.workspaceToCode();
   
   for (var dup in FAQ.DuplicateIds)
   {
	   var dupBlocks = FAQ.Ids[dup];
	   for (var b in dupBlocks)
	   {
		   FAQ.addError(FAQ.Ids[dup][b], 'Block has duplicate id "' + dup + '"', "Error");
	   }
   }
   
   if (FAQ.Errors.length) {
	  // group the errors by block
	  var errors = [];
	  var errCount = 0;
	  var blocks = Blockly.mainWorkspace.getAllBlocks();
	  for (var b = 0, block; block = blocks[b]; b++) {
		 block.Errors = [];
	  }
	  
	  for (var i = 0; i < FAQ.Errors.length; i++)
	  {
		  var err = FAQ.Errors[i];
		  var eArray = err.block.Errors;
		  eArray.push(err.errType + " : " + err.err);
		  if (err.errType === 'Error') errCount++;
	  }

	  for (b = 0; block = blocks[b]; b++) {
		 if (block.Errors.length > 0)
		 {
			errors.push({ block: block, errors: block.Errors} );
		 }
	  }
   }	   
   return { code : code, errors: errors, errCount: errCount};
}

FAQ.statementToCode = function(block, id)
{
   FAQ.DepthCount++;
   var code =  Blockly.JavaScript.statementToCode (block, id);
   FAQ.DepthCount--;
   return code;
}

FAQ.valueToCode = function(block, id, order)
{
   FAQ.DepthCount++;
   var code =  Blockly.JavaScript.valueToCode(block, id, order);
   FAQ.DepthCount--;
   return code;
}

FAQ.addError = function(block, errorText, errorType)
{
   FAQ.Errors.push({ block: block, err: errorText, errType: errorType} );
}

FAQ.checkId = function(block, id)
{
	if (id.length == 0 && FAQ.DepthCount == 0)
	{
		FAQ.addError(block,  "ID should not be blank", "Error");
	} 
	
	if (id.length > 0) {
	   if (typeof FAQ.Ids[id] !== 'undefined')
	   {
		  // duplicate
		  FAQ.Ids[id].push(block);
		  FAQ.DuplicateIds[id] = id;
	   } else {
		  FAQ.Ids[id] = [block];
	   }
	}

}

FAQ.checkNull = function(block, value, description)
{
   if (!value || value === '')
   {
	  FAQ.addError(block, description + " is null. A value is required.", "Error");
   }
};

FAQ.checkDefault = function(block, value, defaultValue, description)
{
   if (value === defaultValue)
   {
	  FAQ.addError(block, description + " is still the default value.", "Warning");
   }
};

FAQ.checkForParent = function(block, description)
{
   if (FAQ.DepthCount == 0)
   {
	  FAQ.addError(block, description + " cannot be at the top level.", "Error");
   }
};


Blockly.JavaScript['question_multiple'] = function(block) {
  var id = block.getFieldValue('id');
  var faq_questions = FAQ.statementToCode(block, 'question_list');
  var title = block.getFieldValue('title');

  FAQ.checkId(block, id);
  FAQ.checkNull(block, faq_questions, "Questions");
  FAQ.checkDefault(block, title, block.defaultValues['title'], "Title");

  var code = 
  "{" +
     '"type": "question_multiple",' + '' +
     '"id":' + JSON.stringify(id) + ',' +'' +
     '"title":' + JSON.stringify(title) + ',' +'' +
	 '"questions": [' + faq_questions + ']' + ',' +'' +
 	 '"eval" : ["questions"]'  +'' +
	 '}';

  if (FAQ.DepthCount == 0)
  {
     code  = 'FAQ.addQuestion(' + JSON.stringify(id) + ',' + code + ');' + '' ;
  } else {
     code += ","+ '' ;
  }
  return code;
};


Blockly.JavaScript['question_single'] = function(block) {
  var id = block.getFieldValue('id');
  var the_answer = FAQ.valueToCode(block, 'the_answer', Blockly.JavaScript.ORDER_ATOMIC);
  var title = block.getFieldValue('title');

  FAQ.checkId(block, id);
  FAQ.checkNull(block, the_answer, "Answer");
  FAQ.checkDefault(block, title, block.defaultValues['title'], "Title");
  
  var code = 
  "{" +
     '"type": "question_single",' + '' +
     '"id":' + JSON.stringify(id) + ',' + '' +
     '"title":' + JSON.stringify(title) + ',' + '' +
	 '"answer": ' + the_answer + ',' + '' +
 	 '"eval" : ["answer"]'  + '' +
	 '}';

  if (FAQ.DepthCount == 0)
  {
     code  = 'FAQ.addQuestion(' + JSON.stringify(id) + ',' + code + ');'+ '' ;
  } else {
     code += ","+ '' ;
  }
  return code;
};

Blockly.JavaScript['question'] = function(block) {

  var id = block.getFieldValue('id');
  var the_question = block.getFieldValue('the_question');
  var yes_answer = FAQ.valueToCode(block, 'yes_answer', Blockly.JavaScript.ORDER_ATOMIC);
  var no_answer = FAQ.valueToCode(block, 'no_answer', Blockly.JavaScript.ORDER_ATOMIC);
  
  FAQ.checkId(block, id);
  FAQ.checkDefault(block, the_question, block.defaultValues['question'], "Question");
  FAQ.checkNull(block, the_question, "Question");
  FAQ.checkNull(block, yes_answer, "Yes answer");
  FAQ.checkNull(block, yes_answer, "No answer");
 
  var code = 
  "{" +
     '"type": "question",' + '' +
     '"id":' + JSON.stringify(id) + ',' + '' +
	 '"q": ' + JSON.stringify(the_question) +',' + '' + 
	 '"y": ' + yes_answer + ',' + '' + 
	 '"n": ' + no_answer +  ',' + '' +
 	 '"eval" : ["y", "n"]' + '' +
	 '}';
  if (FAQ.DepthCount == 0)
  {
     code  = 'FAQ.addQuestion(' + JSON.stringify(id) + ',' + code + '); '+ '';
  } else {
     code += ","+ '' ;
  }
  return code;
};

Blockly.JavaScript['question_link'] = function(block) {
  var id = block.getFieldValue('id');

  FAQ.checkNull(block, id, "Question ID");
  FAQ.checkDefault(block, id, block.defaultValues['id'], "Question ID");

  var obj = 
  {
     type: "question_link",
	 qid: id
  };
  
  var code = JSON.stringify(obj);
  if (FAQ.DepthCount == 0)
  {
     code  = 'FAQ.loadQuestion(' + JSON.stringify(id) + ');';
  } else {
     code += ",";
  }
  return code + '' ;
};



Blockly.JavaScript['answer'] = function(block) {
  var the_answer = block.getFieldValue('the_answer');
  var obj = 
  {
     type: "answer",
	 a: the_answer
  };
  FAQ.checkNull(block, the_answer, "Answer");
  FAQ.checkDefault(block, the_answer, block.defaultValues['answer'], "Answer");
  FAQ.checkForParent(block, "Answer");
  var code = JSON.stringify(obj);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['answer_link'] = function(block) {
  var title = block.getFieldValue('title');
  var answer_url = block.getFieldValue('answer_url');

  FAQ.checkNull(block, title, "Title");
  FAQ.checkDefault(block, title, block.defaultValues['title'], "Title");
  FAQ.checkNull(block, answer_url, "Link to answer");
  FAQ.checkDefault(block, answer_url, block.defaultValues['answer_url'], "Answer URL");
  FAQ.checkForParent(block, "Answer link");

  var obj = 
  {
     type: "answer_link",
	 title: title,
	 url: answer_url
  };
  var code = JSON.stringify(obj);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['answer_question'] = function(block) {
  var the_questions = FAQ.statementToCode(block, 'question_list');
  FAQ.checkNull(block, the_questions, "Questions");
  FAQ.checkForParent(block, "More questions");
  var code = 
  "{" +
     '"type": "answer_question",' + '' +
	 '"questions": [' + the_questions + ']' + ',' + '' +
 	 '"eval" : ["questions"]'  + '' +
	 '}';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

