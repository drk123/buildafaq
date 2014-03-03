/* ========================================================================
 * buildafaq: faq_editor.js v0.0.1
 * ========================================================================
 * Copyright 2014 Dave Klein
 * Licensed under Apache License 2.0 
 *              (https://github.com/drk123/buildafaq/blob/master/LICENSE)
 * ======================================================================== */

var FAQ_EDITOR = FAQ_EDITOR || {};

FAQ_EDITOR.NeedCollapse = false;
FAQ_EDITOR.CurrentEditType = 'xml';

$(window).unload(function(){
	FAQ_EDITOR.saveFile();
});	

FAQ_EDITOR.resize = function()
{	
	var iframe = document.getElementById("blockly_frame");
	var height = window.innerHeight - iframe.offsetTop - 85;
	if(height < 100) height = 100;
	iframe.style.height = '' + height  + 'px';
	var code_window = document.getElementById("code_content");
	height = window.innerHeight - code_window.offsetTop - 85;
	code_window.style.height = '' + height  + 'px';
}
FAQ_EDITOR.resize();
$(window).bind('resize', FAQ_EDITOR.resize);

FAQ_EDITOR.saveFile = function()
{
	var xml = FAQ_EDITOR.blocksToXML();
	$.jStorage.set("blocksXML", xml);
}

FAQ_EDITOR.readFile = function()
{
	if (typeof Blockly === 'undefined') {
		NeedToLoadXML = true;
	} else {
		var xml = $.jStorage.get("blocksXML", "");
		if (xml !== '' && xml !== '<xml></xml>')
		{
			FAQ_EDITOR.xmlToBlocks(xml);
		}
	}
}

$(document).ready(function(){

	$('#nav-main').on('show.bs.collapse', function () {
		FAQ_EDITOR.NeedCollapse = true;
	});	   

	$('#nav-main').on('hide.bs.collapse', function () {
		FAQ_EDITOR.NeedCollapse = false;
	});	   

	$('#menu_edit_faq').click(function(e)
	{
		e.preventDefault();
		FAQ_EDITOR.CurrentEditType = 'xml';
		$(this).tab('show');
		if (FAQ_EDITOR.NeedCollapse) $('#nav-main').collapse('hide');
		FAQ_EDITOR.resize();
	});

	$('#menu_test_faq').click(function(e)
	{
		FAQ_EDITOR.CurrentEditType = 'html';
		e.preventDefault();
		if (FAQ_EDITOR.NeedCollapse) $('#nav-main').collapse('hide');
		FAQ_EDITOR.test();
	});

	$('#menu_code_faq').click(function(e)
	{
		FAQ_EDITOR.CurrentEditType = 'html';
		e.preventDefault();
		if (FAQ_EDITOR.NeedCollapse) $('#nav-main').collapse('hide');
		FAQ_EDITOR.genHTML();
	});

	$('#menu_import_faq').click(function(e)
	{
		e.preventDefault();
		if (FAQ_EDITOR.NeedCollapse) $('#nav-main').collapse('hide');

		$('#file_select').val('');
		$('#importModal').modal('toggle');
	});

	$('#menu_export_faq').click(function(e)
	{
		e.preventDefault();
		if (FAQ_EDITOR.NeedCollapse) $('#nav-main').collapse('hide');
		FAQ_EDITOR.export();
	});

	$('#menu_help').click(function(e)
	{
		e.preventDefault();
		window.open("./help.html");
	});

	$('#acknowledge').click(function(e)
	{
		e.preventDefault();
		$("#acknowledgeModal").modal('toggle');
	});

	$('#answer_edit_save').click(function(e)
	{
		e.preventDefault();
		saveAnswer();
		$("#answerModal").modal('toggle');
	});
	
	
	$('#menu_edit_faq').tooltip();
	$('#menu_code_faq').tooltip();
	$('#menu_export_faq').tooltip();
	$('#menu_import_faq').tooltip();
	$('#menu_test_faq').tooltip();
	$('#menu_help').tooltip();
	$('#gitlink').tooltip();


	// answer modal stuff
	tinymce.init({
selector: "#answer_edit",
width:      '100%',
height:     270,
plugins: [
		"advlist autolink lists link image charmap anchor preview",
			"searchreplace visualblocks",
			"insertdatetime media table contextmenu paste"
		 ],
toolbar: "insertfile undo redo | styleselect | bold italic underline | alignleft aligncenter alignright alignjustify  | link image media ",
statusbar:  false,
menubar:    "edit format insert table view",
rel_list:   [ { title: 'Lightbox', value: 'lightbox' } ]
	});

	/**
	* this workaround makes magic happen
	* thanks @harry: http://stackoverflow.com/questions/18111582/tinymce-4-links-plugin-modal-in-not-editable
	*/
	$(document).on('focusin', function(e) {
		if ($(event.target).closest(".mce-window").length) {
			e.stopImmediatePropagation();
		}
	});	   

	$('#menu_edit_faq').click();
	FAQ_EDITOR.readFile();
});

FAQ_EDITOR.editor = ace.edit("code_content");
FAQ_EDITOR.editor.setTheme("ace/theme/chrome");
FAQ_EDITOR.editor.getSession().setMode("ace/mode/html");

FAQ_EDITOR.errCount=0;

FAQ_EDITOR.displayErrors = function(conversion)
{
	if (typeof conversion.errors !== 'undefined')
	{
		editFAQ.BlockSelect = {};
		var errList = '<strong>Click on the links below to highlight the block with the error.</strong><br><br>';
		errList += '<ul class="list-unstyled">\n';
		for (var i = 0; i < conversion.errors.length; i++)
		{
			if (i > 0)
			{
				errList += "<li>---</li>";
			}
			for (var j = 0; j < conversion.errors[i].errors.length; j++)
			{
				FAQ_EDITOR.errCount++;
				var id = "ID" + FAQ_EDITOR.errCount;
				editFAQ.BlockSelect[id] = conversion.errors[i].block;

				errList += '<li><a href="#" onclick="editFAQ.selectById(\'' + id + '\');">' + conversion.errors[i].errors[j] + '</a><li>\n';
			}
		}
		errList += '</ul>';
		$('#side_content').html(errList);
	} else {
		$('#side_content').html("Looks good!");
	}
}

FAQ_EDITOR.genHTML=function()
{
	var conversion = editFAQ.convertToHTML();
	FAQ_EDITOR.displayErrors(conversion);

	if (conversion.errCount > 0) {
		$('#menu_edit_faq').tab('show');
	} else {
		FAQ_EDITOR.editor.setValue(conversion.code);

		$('#menu_code_faq').tab('show');
	}

	FAQ_EDITOR.resize();
	$('html, body').animate({
scrollTop: $("#side_column").offset().top
	}, 2000);
}

FAQ_EDITOR.export = function()
{
	var appType, fileName, docText;
	if (FAQ_EDITOR.CurrentEditType === 'xml') {
		docText = FAQ_EDITOR.blocksToXML();
		textType = "text/xml";  
		fileName = "faq_blocks.xml";
	} else {
		//var conversion = editFAQ.convertToHTML();
		//docText = conversion.code;
		docText = FAQ_EDITOR.editor.getValue();
		textType = "text/html";
		fileName = "faq_page.html";
	}
	var blob = new Blob([docText], {type: textType});;
	saveAs(blob, fileName);
}


FAQ_EDITOR.test = function()
{
	var conversion = editFAQ.convertToCode();
	FAQ_EDITOR.displayErrors(conversion);



	if (conversion.errCount > 0) {
		$('#menu_edit_faq').tab('show');
	} else {
		FAQ.clearRender();
		var renderer = new FAQ.Renderer();
		FAQ.renderCode("#test_content", renderer, conversion.code);

		$('#menu_test_faq').tab('show');
	}
	FAQ_EDITOR.resize();
	$('html, body').animate({
scrollTop: $("#side_column").offset().top
	}, 2000);
}

FAQ_EDITOR.blocksToXML = function() {
	var xml = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
	return Blockly.Xml.domToText(xml);
};

FAQ_EDITOR.xmlToBlocks = function(xmlText) {
	try {
		Blockly.getMainWorkspace().clear();
		if (typeof xmlText !== undefined && xmlText != '') {
			var xml = Blockly.Xml.textToDom(xmlText);
			Blockly.Xml.domToWorkspace(Blockly.getMainWorkspace(), xml);
			$('#side_content').html("");
		}
	} catch (e) {
		$('#side_content').html("Hey, that's not valid XML!!!");
	}
};

// Inspired by http://www.htmlgoodies.com/html5/javascript/drag-files-into-the-browser-from-the-desktop-HTML5.html
if(window.FileReader) { 
	$(window).bind('load', function() {
		var status = document.getElementById('drop_status');
		var drop   = document.getElementById('drop_zone');
		var list   = document.getElementById('drop_list');

		function cancel(e) {
			if (e.preventDefault) { e.preventDefault(); }
			return false;
		}

		function drag_over(e)
		{
			e.stopPropagation();
			e.preventDefault();
			if (e.type === "dragover")
			{
				$(e.target).addClass("drop_hover");
			} else {
				$(e.target).removeClass("drop_hover");
			}
		}

		// Tells the browser that we *can* drop on this target
		$("#drop_zone").bind( 'dragover', drag_over);
		$("#drop_zone").bind( 'dragleave', drag_over);
		$("#drop_zone").bind( 'dragenter', cancel);
		$("#drop_zone").bind( 'drop', function (jqe) {
			e = jqe.originalEvent;
			if (e.preventDefault) { e.preventDefault(); } // stops the browser from redirecting 
			var dt    = e.dataTransfer;
			var files = dt.files;
			FAQ_EDITOR.readFiles(files);
			return false;
		});
	});
} else { 
	document.getElementById('drop_status').innerHTML = 'Your browser does not support file drag-and-drop.';
}	

FAQ_EDITOR.readFiles = function(files)
{
	for (var i = 0, f; f = files[i], i < 1; i++) {
		var reader = new FileReader();
		//attach event handlers here...
		$(reader).bind('loadend', function(e) {
			var text = this.result; 
			FAQ_EDITOR.xmlToBlocks(text);
			$('#importModal').modal('hide');
		});					   
		reader.readAsText(f);
	}
}

$('#file_select').bind('change', 
	function(jqe) {
		var evt = jqe.originalEvent;
		FAQ_EDITOR.readFiles(evt.target.files);
}
);
