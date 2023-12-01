"use strict";(self.webpackChunkcollaborative_input=self.webpackChunkcollaborative_input||[]).push([[707],{"./src/StrBinding.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Input:()=>Input,Textarea:()=>Textarea,__namedExportsOrder:()=>__namedExportsOrder,default:()=>StrBinding_stories});var react=__webpack_require__("./node_modules/react/index.js"),json_crdt=__webpack_require__("./node_modules/json-joy/es2020/json-crdt/index.js");class Selection{start=null;end=null;dir=null;ts=0;tick=0;startId=null;endId=null}const diff=__webpack_require__("./node_modules/fast-diff/diff.js");var DIFF_CHANGE_TYPE=function(DIFF_CHANGE_TYPE){return DIFF_CHANGE_TYPE[DIFF_CHANGE_TYPE.DELETE=-1]="DELETE",DIFF_CHANGE_TYPE[DIFF_CHANGE_TYPE.EQUAL=0]="EQUAL",DIFF_CHANGE_TYPE[DIFF_CHANGE_TYPE.INSERT=1]="INSERT",DIFF_CHANGE_TYPE}(DIFF_CHANGE_TYPE||{});class StrBinding{static bind=(str,input,polling)=>{const binding=new StrBinding(str,input);return binding.syncFromModel(),binding.bind(polling),binding.unbind};selection=new Selection;firstOnly=(()=>{let invoked=!1;return fn=>{if(!invoked){invoked=!0;try{fn()}finally{invoked=!1}}}})();constructor(str,input){this.str=str,this.input=input}saveSelection(){const{str,input,selection}=this,{selectionStart,selectionEnd,selectionDirection}=input,{start,end}=selection,now=Date.now(),tick=str.api.model.tick;start===selectionStart&&end===selectionEnd&&(tick===selection.tick||now-selection.ts<3e3)||(selection.start=selectionStart,selection.end=selectionEnd,selection.dir=selectionDirection,selection.ts=now,selection.tick=tick,selection.startId="number"==typeof selectionStart?str.findId((selectionStart??0)-1)??null:null,selection.endId="number"==typeof selectionEnd?str.findId((selectionEnd??0)-1)??null:null)}syncFromModel(){const{input,str}=this;input.value=str.view()}onModelChange=()=>{this.firstOnly((()=>{this.syncFromModel();const{input,selection,str}=this,start=selection.startId?str.findPos(selection.startId)+1:null,end=selection.endId?str.findPos(selection.endId)+1:null;input.setSelectionRange(start,end,selection.dir??void 0),this.saveSelection()}))};syncFromInput(){const{str,input}=this,view=str.view(),value=input.value;if(value===view)return;const selection=this.selection,caretPos=selection.start===selection.end?selection.start??void 0:void 0,changes=diff(view,value,caretPos),changeLen=changes.length;let pos=0;for(let i=0;i<changeLen;i++){const change=changes[i],[type,text]=change;switch(type){case DIFF_CHANGE_TYPE.DELETE:str.del(pos,text.length);break;case DIFF_CHANGE_TYPE.EQUAL:pos+=text.length;break;case DIFF_CHANGE_TYPE.INSERT:str.ins(pos,text),pos+=text.length}}}changeFromEvent(event){const{input}=this,{data,inputType,isComposing}=event;if(!isComposing)switch(inputType){case"deleteContentBackward":{const{selection}=this,{start,end}=selection;if("number"!=typeof start||"number"!=typeof end)return;return start===end?[start-1,1,""]:[start,end-start,""]}case"deleteContentForward":{const{selection}=this,{start,end}=selection;if("number"!=typeof start||"number"!=typeof end)return;return start===end?[start,1,""]:[start,end-start,""]}case"deleteByCut":{const{start,end}=this.selection;if("number"!=typeof start||"number"!=typeof end)return;if(start===end)return;const min=Math.min(start,end),max=Math.max(start,end),view=this.str.view(),value=this.input.value;if(view.length-value.length!=max-min)return;return[min,max-min,""]}case"insertFromPaste":{const{start,end}=this.selection;if("number"!=typeof start||"number"!=typeof end)return;const min=Math.min(start,end),max=Math.max(start,end),view=this.str.view(),input=this.input,value=input.value,newMax=Math.max(input.selectionStart??0,input.selectionEnd??0);if(newMax<=min)return;const remove=max-min,insert=value.slice(min,newMax);if(value.length!==view.length-remove+insert.length)return;return[min,remove,insert]}case"insertText":{if(!data||1!==data.length)return;const{selectionStart,selectionEnd}=input;if(null===selectionStart||null===selectionEnd)return;if(selectionStart!==selectionEnd)return;if(selectionStart<=0)return;const selection=this.selection;if(selectionStart-data.length!==selection.start)return;if("number"!=typeof selection.end||"number"!=typeof selection.end)return;const remove=selection.end-selection.start;return[selection.start,remove,data]}}}onInput=event=>{this.firstOnly((()=>{const input=this.input,change=this.changeFromEvent(event);if(change){const view=this.str.view(),value=input.value;if(((str,_ref)=>{let[position,remove,insert]=_ref;return str.slice(0,position)+insert+str.slice(position+remove)})(view,change)===value){const str=this.str,[position,remove,insert]=change;remove&&str.del(position,remove),insert&&str.ins(position,insert)}}this.syncFromInput(),this.saveSelection()}))};onSelectionChange=()=>{this.saveSelection()};pollingInterval=1e3;pollingRef=null;pollChanges=()=>{this.pollingRef=setTimeout((()=>{this.firstOnly((()=>{try{const{input,str}=this,view=str.view();view!==input.value&&this.syncFromInput()}catch{}this.pollingRef&&this.pollChanges()}))}),this.pollingInterval)};stopPolling(){this.pollingRef&&clearTimeout(this.pollingRef),this.pollingRef=null}unsubscribeModel=null;bind=polling=>{this.input.addEventListener("input",this.onInput),document.addEventListener("selectionchange",this.onSelectionChange),polling&&this.pollChanges(),this.unsubscribeModel=this.str.api.onChange.listen(this.onModelChange)};unbind=()=>{this.input.removeEventListener("input",this.onInput),document.removeEventListener("selectionchange",this.onSelectionChange),this.stopPolling(),this.unsubscribeModel&&this.unsubscribeModel()}}var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const Demo=_ref=>{let{textarea}=_ref;const inputRef=react.useRef(null),[model,clone]=react.useMemo((()=>{const model=json_crdt.Model.withLogicalClock();return model.api.root({text:"Hell"}),[model,model.clone()]}),[1]);return react.useSyncExternalStore(model.api.subscribe,(()=>model.tick)),react.useEffect((()=>{if(!inputRef.current)return;const input=inputRef.current,unbind=StrBinding.bind(model.api.str(["text"]),input,!0);return()=>{unbind()}}),[model]),(0,jsx_runtime.jsxs)("div",{children:[textarea?(0,jsx_runtime.jsx)("textarea",{ref:inputRef}):(0,jsx_runtime.jsx)("input",{ref:inputRef,type:"text"}),(0,jsx_runtime.jsx)("div",{children:(0,jsx_runtime.jsx)("button",{onClick:()=>{const input=inputRef.current;input&&(input.value+="!")},children:'Append "!" to input'})}),(0,jsx_runtime.jsx)("div",{children:(0,jsx_runtime.jsx)("button",{onClick:()=>{const str=model.api.str(["text"]);str.ins(str.view().length,"?")},children:'Append "?" to model'})}),(0,jsx_runtime.jsx)("div",{children:(0,jsx_runtime.jsx)("button",{onClick:()=>{setTimeout((()=>{const str=model.api.str(["text"]);str.ins(str.view().length,"?")}),2e3)},children:'Append "?" to model after 2s'})}),(0,jsx_runtime.jsx)("div",{children:(0,jsx_runtime.jsx)("button",{onClick:()=>{setTimeout((()=>{model.api.str(["text"]).ins(0,"1. ")}),2e3)},children:'Prepend "1. " to model after 2s'})}),(0,jsx_runtime.jsx)("div",{children:(0,jsx_runtime.jsx)("button",{onClick:()=>{setTimeout((()=>{model.reset(clone)}),2e3)},children:"RESET after 2s"})}),(0,jsx_runtime.jsx)("pre",{style:{fontSize:"10px"},children:(0,jsx_runtime.jsx)("code",{children:model.root+""})})]})};Demo.displayName="Demo";const StrBinding_stories={title:"StrBinding",component:Demo,argTypes:{}},Input={args:{}},Textarea={args:{textarea:!0}};Input.parameters={...Input.parameters,docs:{...Input.parameters?.docs,source:{originalSource:"{\n  args: {}\n}",...Input.parameters?.docs?.source}}},Textarea.parameters={...Textarea.parameters,docs:{...Textarea.parameters?.docs,source:{originalSource:"{\n  args: ({\n    textarea: true\n  } as any)\n}",...Textarea.parameters?.docs?.source}}};const __namedExportsOrder=["Input","Textarea"]}}]);