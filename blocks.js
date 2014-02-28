/* ========================================================================
 * buildafaq: blocks.js v0.0.1
 * ========================================================================
 * Copyright 2014 Dave Klein
 * Licensed under Apache License 2.0 
 *              (https://github.com/drk123/buildafaq/blob/master/LICENSE)
 * ======================================================================== */

var AAACount = {};
function AAANextId(block, prefix)
{
  if (!AAACount[prefix]) {
	 AAACount[prefix] = 1;
  }
  
  var id =  prefix + AAACount[prefix];
  if (!block.workspace.isFlyout) AAACount[prefix]++;
  return id;
}

function AAAValidateId(id)
{
	var newId = id.trim().replace(/\//g, "");
	if (newId !== id)
	{
	   var a = 10;
	}
	
	return newId;
}

Blockly.FAQ = {};
Blockly.FAQ.faqConnectors = ["question_multiple", "question_single", "question", "question_link"];

Blockly.Blocks['question_multiple'] = {
  init: function() {
	this.defaultValues = { title: "title" };
    this.setHelpUrl('http://www.example.com/');
    this.setColour(360);
    this.appendDummyInput()
        .appendField("multiple");
    this.appendDummyInput()
        .appendField("id")
        .appendField(new Blockly.FieldTextInput(AAANextId(this, "q"), AAAValidateId), "id");
    this.appendDummyInput()
        .appendField("title")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['title']), "title");
    this.appendStatementInput("question_list")
        .appendField("questions")
	     .setCheck(Blockly.FAQ.faqConnectors);
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
  }
};

Blockly.Blocks['question'] = {
  init: function() {
	this.defaultValues = { question: "a yes or no question" };
    this.setHelpUrl('http://www.example.com/');
    this.setColour(340);
    this.appendDummyInput()
        .appendField("yes/no");
    this.appendDummyInput()
        .appendField("id")
        .appendField(new Blockly.FieldTextInput(AAANextId(this, "q"), AAAValidateId), "id");
    this.appendDummyInput()
        .appendField("question")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['question']), "the_question");
    this.appendValueInput("yes_answer")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("yes");
    this.appendValueInput("no_answer")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("no");
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
	
  }
};

Blockly.Blocks['question_single'] = {
  init: function() {
	this.defaultValues = { title: "title" };
    this.setHelpUrl('http://www.example.com/');
    this.setColour(320);
    this.appendDummyInput()
        .appendField("single");
    this.appendDummyInput()
        .appendField("id")
        .appendField(new Blockly.FieldTextInput(AAANextId(this, "q"), AAAValidateId), "id");
    this.appendDummyInput()
        .appendField("title")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['title']), "title");
    this.appendValueInput("the_answer")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("answer");
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
	
  }
};

Blockly.Blocks['question_link'] = {
  init: function() {
	this.defaultValues = { id: "id" };
    this.setHelpUrl('http://www.example.com/');
    this.setColour(300);
    this.appendDummyInput()
        .appendField("link to a question");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("question id")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['id']), "id");
    this.setPreviousStatement(true, Blockly.FAQ.faqConnectors);
    this.setNextStatement(true, Blockly.FAQ.faqConnectors);
    this.setTooltip('');
  }
};




Blockly.Blocks['answer'] = {
  init: function() {
  	this.defaultValues = { answer: "an answer" };
    this.setHelpUrl('http://www.example.com/');
    this.setColour(160);
    this.appendDummyInput()
        .appendField("answer")
        .appendField(new Blockly.FieldTextAreaInput(this.defaultValues['answer'], FAQ.editAnswer), "the_answer");
    this.setInputsInline(true);
    this.setOutput(true, "answer");
    this.setTooltip('');
  }
};

Blockly.Blocks['answer_link'] = {
  init: function() {
  	this.defaultValues = { answer_url: "http://example.com", title: "title" };

    this.setHelpUrl('http://www.example.com/');
    this.setColour(140);
    this.appendDummyInput()
        .appendField("link to web page");
    this.appendDummyInput()
        .appendField("title")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['title']), "title");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("url")
        .appendField(new Blockly.FieldTextInput(this.defaultValues['answer_url']), "answer_url");
    this.setOutput(true, 'answer');
    this.setTooltip('');
  }
};

Blockly.Blocks['answer_question'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(120);
    this.appendDummyInput()
        .appendField("more questions");
    this.appendStatementInput("question_list")
        .appendField("questions")
	     .setCheck(Blockly.FAQ.faqConnectors);
    this.setOutput(true, 'answer');
    this.setTooltip('');
  }
};





