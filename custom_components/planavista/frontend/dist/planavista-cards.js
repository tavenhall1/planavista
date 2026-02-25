function t(t,e,i,a){var n,r=arguments.length,s=r<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,a);else for(var o=t.length-1;o>=0;o--)(n=t[o])&&(s=(r<3?n(s):r>3?n(e,i,s):n(e,i))||s);return r>3&&s&&Object.defineProperty(e,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),n=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const s=t=>new r("string"==typeof t?t:t+"",void 0,a),o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,a)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new r(i,t,a)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return s(e)})(t):t,{is:d,defineProperty:c,getOwnPropertyDescriptor:p,getOwnPropertyNames:h,getOwnPropertySymbols:v,getPrototypeOf:g}=Object,u=globalThis,m=u.trustedTypes,f=m?m.emptyScript:"",y=u.reactiveElementPolyfillSupport,x=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},w=(t,e)=>!d(t,e),_={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=_){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),a=this.getPropertyDescriptor(t,i,e);void 0!==a&&c(this.prototype,t,a)}}static getPropertyDescriptor(t,e,i){const{get:a,set:n}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:a,set(e){const r=a?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??_}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const t=this.properties,e=[...h(t),...v(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,a)=>{if(i)t.adoptedStyleSheets=a.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of a){const a=document.createElement("style"),n=e.litNonce;void 0!==n&&a.setAttribute("nonce",n),a.textContent=i.cssText,t.appendChild(a)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,i);if(void 0!==a&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(a):this.setAttribute(a,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,a=i._$Eh.get(t);if(void 0!==a&&this._$Em!==a){const t=i.getPropertyOptions(a),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=a;const r=n.fromAttribute(e,t.type);this[a]=r??this._$Ej?.get(a)??r,this._$Em=null}}requestUpdate(t,e,i,a=!1,n){if(void 0!==t){const r=this.constructor;if(!1===a&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??w)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:a,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===a&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,a=this[e];!0!==t||this._$AL.has(e)||void 0===a||this.C(e,void 0,i,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[x("elementProperties")]=new Map,$[x("finalized")]=new Map,y?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,C=t=>t,D=k.trustedTypes,F=D?D.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+E,z=`<${S}>`,T=document,M=()=>T.createComment(""),B=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,P="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,j=/>/g,L=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,I=/"/g,V=/^(?:script|style|textarea|title)$/i,R=(t,...e)=>({_$litType$:1,strings:t,values:e}),Y=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),q=new WeakMap,Q=T.createTreeWalker(T,129);function Z(t,e){if(!H(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==F?F.createHTML(e):e}const X=(t,e)=>{const i=t.length-1,a=[];let n,r=2===e?"<svg>":3===e?"<math>":"",s=U;for(let e=0;e<i;e++){const i=t[e];let o,l,d=-1,c=0;for(;c<i.length&&(s.lastIndex=c,l=s.exec(i),null!==l);)c=s.lastIndex,s===U?"!--"===l[1]?s=O:void 0!==l[1]?s=j:void 0!==l[2]?(V.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=L):void 0!==l[3]&&(s=L):s===L?">"===l[0]?(s=n??U,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,o=l[1],s=void 0===l[3]?L:'"'===l[3]?I:N):s===I||s===N?s=L:s===O||s===j?s=U:(s=L,n=void 0);const p=s===L&&t[e+1].startsWith("/>")?" ":"";r+=s===U?i+z:d>=0?(a.push(o),i.slice(0,d)+A+i.slice(d)+E+p):i+E+(-2===d?e:p)}return[Z(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),a]};class J{constructor({strings:t,_$litType$:e},i){let a;this.parts=[];let n=0,r=0;const s=t.length-1,o=this.parts,[l,d]=X(t,e);if(this.el=J.createElement(l,i),Q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(a=Q.nextNode())&&o.length<s;){if(1===a.nodeType){if(a.hasAttributes())for(const t of a.getAttributeNames())if(t.endsWith(A)){const e=d[r++],i=a.getAttribute(t).split(E),s=/([.?@])?(.*)/.exec(e);o.push({type:1,index:n,name:s[2],strings:i,ctor:"."===s[1]?it:"?"===s[1]?at:"@"===s[1]?nt:et}),a.removeAttribute(t)}else t.startsWith(E)&&(o.push({type:6,index:n}),a.removeAttribute(t));if(V.test(a.tagName)){const t=a.textContent.split(E),e=t.length-1;if(e>0){a.textContent=D?D.emptyScript:"";for(let i=0;i<e;i++)a.append(t[i],M()),Q.nextNode(),o.push({type:2,index:++n});a.append(t[e],M())}}}else if(8===a.nodeType)if(a.data===S)o.push({type:2,index:n});else{let t=-1;for(;-1!==(t=a.data.indexOf(E,t+1));)o.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function K(t,e,i=t,a){if(e===Y)return e;let n=void 0!==a?i._$Co?.[a]:i._$Cl;const r=B(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,a)),void 0!==a?(i._$Co??=[])[a]=n:i._$Cl=n),void 0!==n&&(e=K(t,n._$AS(t,e.values),n,a)),e}class G{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,a=(t?.creationScope??T).importNode(e,!0);Q.currentNode=a;let n=Q.nextNode(),r=0,s=0,o=i[0];for(;void 0!==o;){if(r===o.index){let e;2===o.type?e=new tt(n,n.nextSibling,this,t):1===o.type?e=new o.ctor(n,o.name,o.strings,this,t):6===o.type&&(e=new rt(n,this,t)),this._$AV.push(e),o=i[++s]}r!==o?.index&&(n=Q.nextNode(),r++)}return Q.currentNode=T,a}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,a){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),B(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==Y&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>H(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&B(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,a="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(Z(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(e);else{const t=new G(a,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new J(t)),e}k(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,a=0;for(const n of t)a===e.length?e.push(i=new tt(this.O(M()),this.O(M()),this,this.options)):i=e[a],i._$AI(n),a++;a<e.length&&(this._$AR(i&&i._$AB.nextSibling,a),e.length=a)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=C(t).nextSibling;C(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,a,n){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=a,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,a){const n=this.strings;let r=!1;if(void 0===n)t=K(this,t,e,0),r=!B(t)||t!==this._$AH&&t!==Y,r&&(this._$AH=t);else{const a=t;let s,o;for(t=n[0],s=0;s<n.length-1;s++)o=K(this,a[i+s],e,s),o===Y&&(o=this._$AH[s]),r||=!B(o)||o!==this._$AH[s],o===W?t=W:t!==W&&(t+=(o??"")+n[s+1]),this._$AH[s]=o}r&&!a&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class at extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class nt extends et{constructor(t,e,i,a,n){super(t,e,i,a,n),this.type=5}_$AI(t,e=this){if((t=K(this,t,e,0)??W)===Y)return;const i=this._$AH,a=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==W&&(i===W||a);a&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const st=k.litHtmlPolyfillSupport;st?.(J,tt),(k.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;class lt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const a=i?.renderBefore??e;let n=a._$litPart$;if(void 0===n){const t=i?.renderBefore??null;a._$litPart$=n=new tt(e.insertBefore(M(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Y}}lt._$litElement$=!0,lt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:lt});const dt=ot.litElementPolyfillSupport;dt?.({LitElement:lt}),(ot.litElementVersions??=[]).push("4.2.2");const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:w},ht=(t=pt,e,i)=>{const{kind:a,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===a&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===a){const{name:a}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(a,n,t,!0,i)},init(e){return void 0!==e&&this.C(a,void 0,t,e),e}}}if("setter"===a){const{name:a}=i;return function(i){const n=this[a];e.call(this,i),this.requestUpdate(a,n,t,!0,i)}}throw Error("Unsupported decorator location: "+a)};function vt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const a=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),a?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function gt(t){return vt({...t,state:!0,attribute:!1})}async function ut(t,e){const i={summary:e.summary};e.start_date_time&&(i.start_date_time=e.start_date_time),e.end_date_time&&(i.end_date_time=e.end_date_time),e.start_date&&(i.start_date=e.start_date),e.end_date&&(i.end_date=e.end_date),e.description&&(i.description=e.description),e.location&&(i.location=e.location),await t.callService("calendar","create_event",i,{entity_id:e.entity_id})}async function mt(t,e){const i={uid:e.uid};e.recurrence_id&&(i.recurrence_id=e.recurrence_id),await t.callService("calendar","delete_event",i,{entity_id:e.entity_id})}async function ft(t,e="sensor.planavista_config"){await t.callService("homeassistant","update_entity",{entity_id:e})}function yt(t,e="sensor.planavista_config"){const i=t.states[e];if(!i)return null;const a=i.attributes;return{calendars:a.calendars||[],events:a.events||[],display:a.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},version:a.version}}function xt(t,e){if(!e)return null;const i=t.states[e];return i?.attributes?.entity_picture||null}function bt(t,e){if(!e)return"";const i=t.states[e];return i?.attributes?.friendly_name||e.replace("person.","")}function wt(t,e="12h"){const i=new Date(t);return"24h"===e?i.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):i.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function _t(t,e="medium"){switch(e){case"long":return t.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return t.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return t.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return t.toLocaleDateString("en-US",{weekday:"long"})}}function $t(t){const e=new Date;return t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}function kt(t,e="sunday"){const i=new Date(t),a=i.getDay(),n="monday"===e?0===a?-6:1-a:-a;return i.setDate(i.getDate()+n),i.setHours(0,0,0,0),i}function Ct(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}class Dt{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this.startAutoAdvance()}static getInstance(){return Dt._instance||(Dt._instance=new Dt),Dt._instance}subscribe(t){this._hosts.add(t)}unsubscribe(t){this._hosts.delete(t)}_notify(){for(const t of this._hosts)t.requestUpdate()}toggleCalendar(t){this.hiddenCalendars.has(t)?this.hiddenCalendars.delete(t):this.hiddenCalendars.add(t),this._notify()}setView(t){this.currentView!==t&&(this.currentView=t,this._notify())}navigateDate(t){this.currentDate="today"===t?new Date:function(t,e,i){const a=new Date(t),n="next"===i?1:-1;switch(e){case"day":a.setDate(a.getDate()+n);break;case"week":case"agenda":a.setDate(a.getDate()+7*n);break;case"month":a.setMonth(a.getMonth()+n)}return a}(this.currentDate,this.currentView,t),this._notify()}setDate(t){this.currentDate=new Date(t),this._notify()}selectEvent(t){this.selectedEvent=t,this._notify()}openCreateDialog(t){this.dialogOpen="create",this.createPrefill=t||null,this._notify()}openEditDialog(t){this.dialogOpen="edit",this.selectedEvent=t,this.createPrefill={...t},this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(t,e){this.isLoading=!0,this._notify();try{await ut(t,e),await ft(t),this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to create event",t),t}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(t,e){this.isLoading=!0,this._notify();try{await mt(t,e),await ft(t),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to delete event",t),t}finally{this.isLoading=!1,this._notify()}}async doEditEvent(t,e,i){this.isLoading=!0,this._notify();try{await mt(t,e),await ut(t,i),await ft(t),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to edit event",t),t}finally{this.isLoading=!1,this._notify()}}startAutoAdvance(){this._autoAdvanceTimer||(this._autoAdvanceTimer=setInterval(()=>{const t=new Date;t.getDate()===this.currentDate.getDate()&&t.getMonth()===this.currentDate.getMonth()&&t.getFullYear()===this.currentDate.getFullYear()||this.currentDate.toDateString()===new Date(Date.now()-6e4).toDateString()&&(this.currentDate=t,this._notify())},6e4))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null)}}class Ft{constructor(t){this.host=t,this._state=Dt.getInstance(),t.addController(this)}hostConnected(){this._state.subscribe(this.host)}hostDisconnected(){this._state.unsubscribe(this.host)}get state(){return this._state}}const At={light:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#6366F1","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(99, 102, 241, 0.06)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.12)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},dark:{"--pv-bg":"#1A1B1E","--pv-card-bg":"#25262B","--pv-card-bg-elevated":"#2C2E33","--pv-text":"#E4E5E7","--pv-text-secondary":"#909296","--pv-text-muted":"#5C5F66","--pv-border":"#373A40","--pv-border-subtle":"#2C2E33","--pv-accent":"#818CF8","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(129, 140, 248, 0.08)","--pv-now-color":"#F87171","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.4)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #3730A3 0%, #581C87 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},minimal:{"--pv-bg":"#FFFFFF","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#111827","--pv-text-secondary":"#6B7280","--pv-text-muted":"#D1D5DB","--pv-border":"#F3F4F6","--pv-border-subtle":"#F9FAFB","--pv-accent":"#111827","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.02)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"#111827","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.2)"},vibrant:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#7C3AED","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(124, 58, 237, 0.2)"}};function Et(t,e="light"){const i=At[e]||At.light;for(const[e,a]of Object.entries(i))t.style.setProperty(e,a)}function St(t,e){const i=t||e||"light";return"planavista"===i?"light":i in At?i:"light"}const zt=o`
  :host {
    display: block;
    font-family: var(--pv-font-family, Inter, -apple-system, system-ui, sans-serif);
    color: var(--pv-text, #1A1B1E);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ha-card {
    background: var(--pv-card-bg, #FFFFFF);
    border-radius: var(--pv-radius, 12px);
    box-shadow: var(--pv-shadow);
    overflow: hidden;
    transition: box-shadow var(--pv-transition, 200ms ease);
    border: none;
  }

  ha-card:hover {
    box-shadow: var(--pv-shadow-lg);
  }
`,Tt=o`
  .pv-display {
    font-size: 3.5rem;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .pv-heading-1 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .pv-heading-2 {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .pv-body {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.5;
  }

  .pv-caption {
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    color: var(--pv-text-secondary);
  }

  .pv-overline {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--pv-text-muted);
  }
`,Mt=o`
  .pv-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: var(--pv-radius-sm, 8px);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--pv-transition, 200ms ease);
    min-height: 48px;
    min-width: 48px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .pv-btn-primary {
    background: var(--pv-accent);
    color: var(--pv-accent-text);
  }

  .pv-btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--pv-shadow);
  }

  .pv-btn-primary:active {
    transform: translateY(0);
  }

  .pv-btn-secondary {
    background: transparent;
    color: var(--pv-text);
    border: 1px solid var(--pv-border);
  }

  .pv-btn-secondary:hover {
    background: var(--pv-event-hover);
  }

  .pv-btn-ghost {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
  }

  .pv-btn-ghost:hover {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  .pv-btn-icon {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
    border-radius: 50%;
    min-height: 48px;
    min-width: 48px;
  }

  .pv-btn-icon:hover {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  .pv-btn-pill {
    border-radius: 9999px;
    padding: 0.5rem 1rem;
  }
`,Bt=o`
  .pv-event {
    position: relative;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border-radius: var(--pv-radius-sm, 8px);
    border-left: 3px solid var(--event-color, var(--pv-accent));
    background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 8%, transparent);
    cursor: pointer;
    transition: all var(--pv-transition, 200ms ease);
    min-height: 28px;
    overflow: hidden;
  }

  .pv-event:hover {
    background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 14%, transparent);
    transform: translateY(-1px);
    box-shadow: var(--pv-shadow);
  }

  .pv-event:active {
    transform: scale(0.98);
  }

  .pv-event-title {
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pv-event-time {
    font-size: 0.6875rem;
    color: var(--pv-text-secondary);
    margin-top: 1px;
  }

  .pv-event-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background: var(--event-color, var(--pv-accent));
    color: white;
    font-size: 0.6875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`,Ht=o`
  .pv-overlay {
    position: fixed;
    inset: 0;
    background: var(--pv-backdrop, rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: pv-fadeIn var(--pv-transition, 200ms ease) forwards;
  }

  .pv-dialog {
    background: var(--pv-card-bg-elevated, #FFFFFF);
    border-radius: var(--pv-radius-lg, 16px);
    box-shadow: var(--pv-shadow-xl);
    max-width: 480px;
    width: calc(100% - 2rem);
    max-height: 85vh;
    overflow-y: auto;
    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
  }

  .pv-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--pv-border-subtle);
  }

  .pv-dialog-body {
    padding: 1.5rem;
  }

  .pv-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--pv-border-subtle);
  }

  .pv-popup {
    background: var(--pv-card-bg-elevated, #FFFFFF);
    border-radius: var(--pv-radius-lg, 16px);
    box-shadow: var(--pv-shadow-xl);
    max-width: 360px;
    width: calc(100% - 2rem);
    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
  }
`,Pt=o`
  .pv-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--pv-border);
    border-radius: var(--pv-radius-sm, 8px);
    background: var(--pv-card-bg);
    color: var(--pv-text);
    font-family: inherit;
    font-size: 0.9375rem;
    transition: border-color var(--pv-transition, 200ms ease);
    box-sizing: border-box;
    min-height: 48px;
  }

  .pv-input:focus {
    outline: none;
    border-color: var(--pv-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent) 15%, transparent);
  }

  .pv-input::placeholder {
    color: var(--pv-text-muted);
  }

  .pv-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--pv-text-secondary);
    margin-bottom: 0.375rem;
  }

  .pv-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
  }

  .pv-toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--pv-border);
    border-radius: 12px;
    cursor: pointer;
    transition: background var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active {
    background: var(--pv-accent);
  }

  .pv-toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active::after {
    transform: translateX(20px);
  }
`,Ut=o`
  .pv-now-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--pv-now-color, #EF4444);
    z-index: 10;
    pointer-events: none;
  }

  .pv-now-line::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--pv-now-color, #EF4444);
  }

  @keyframes pv-nowPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .pv-now-line {
    animation: pv-nowPulse 3s ease-in-out infinite;
  }
`,Ot=o`
  @keyframes pv-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pv-fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes pv-slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pv-slideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pv-scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes pv-slideLeft {
    from { transform: translateX(24px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pv-slideRight {
    from { transform: translateX(-24px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;function jt(t){const e=t.start,i=t.end;if(!e.includes("T")&&!i.includes("T"))return!0;const a=new Date(e),n=new Date(i);return 0===a.getHours()&&0===a.getMinutes()&&0===n.getHours()&&0===n.getMinutes()&&n.getTime()-a.getTime()>=864e5}function Lt(t){const e=new Map;for(const i of t){const t=new Date(i.start),a=new Date(i.end),n=new Date(t);n.setHours(0,0,0,0);const r=new Date(a);for(r.setHours(0,0,0,0);n<=r;){const t=Ct(n);e.has(t)||e.set(t,[]),e.get(t).push(i),n.setDate(n.getDate()+1)}}for(const[,t]of e)t.sort((t,e)=>{const i=jt(t),a=jt(e);return i&&!a?-1:!i&&a?1:new Date(t.start).getTime()-new Date(e.start).getTime()});return e}function Nt(t,e,i){return t.filter(t=>{const a=new Date(t.start),n=new Date(t.end);return a<i&&n>e})}function It(t,e=0,i=24){const a=new Date(t.start),n=new Date(t.end),r=60*(i-e),s=Math.max(0,60*(a.getHours()-e)+a.getMinutes()),o=Math.min(r,60*(n.getHours()-e)+n.getMinutes());return{top:s/r*100,height:Math.max(o-s,15)/r*100}}function Vt(t){const e=t.filter(t=>!jt(t)).sort((t,e)=>new Date(t.start).getTime()-new Date(e.start).getTime()),i=[],a=[];for(const t of e){const e=new Date(t.start).getTime(),n=new Date(t.end).getTime();let r=!1;for(let s=0;s<a.length;s++)if(e>=a[s].end){a[s].end=n,i.push({...t,column:s,totalColumns:0}),r=!0;break}r||(a.push({end:n}),i.push({...t,column:a.length-1,totalColumns:0}))}const n=a.length;for(const t of i)t.totalColumns=n;return i}function Rt(t,e){return t.filter(t=>!e.has(t.calendar_entity_id))}o`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--pv-border);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--pv-text-muted);
  }
`;let Yt=class extends lt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h"}firstUpdated(){this._scrollToNow()}updated(t){super.updated(t),t.has("currentDate")&&this._scrollToNow()}_scrollToNow(){requestAnimationFrame(()=>{const t=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!t)return;this._scrollContainer=t;const e=new Date,i=60*(e.getHours()-6)+e.getMinutes();if(i>0&&i<1020){const e=i/1020*t.scrollHeight-t.clientHeight/3;t.scrollTo({top:Math.max(0,e),behavior:"smooth"})}})}render(){const t=Rt(this.events,this.hiddenCalendars),e=new Date(this.currentDate);e.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setHours(23,59,59,999);const a=Nt(t,e,i),n=a.filter(t=>jt(t)),r=a.filter(t=>!jt(t)),s=this.calendars.filter(t=>!1!==t.visible&&!this.hiddenCalendars.has(t.entity_id)),o=function(t,e){const i=new Map,a=new Map(e.map(t=>[t.entity_id,t]));for(const t of e)if(!1!==t.visible){const e=t.person_entity||t.entity_id;i.has(e)||i.set(e,[])}for(const e of t){const t=a.get(e.calendar_entity_id),n=t?.person_entity||e.calendar_entity_id;i.has(n)||i.set(n,[]),i.get(n).push(e)}return i}(r,s),l=Array.from(o.keys()),d=new Date,c=d.toDateString()===this.currentDate.toDateString(),p=60*(d.getHours()-6)+d.getMinutes(),h=c?p/1020*100:-1;return 0===s.length?R`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `:R`
      <div class="day-container">
        ${n.length>0?R`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${n.map(t=>R`
                <div
                  class="all-day-chip"
                  style="background: ${t.calendar_color}"
                  @click=${()=>this._onEventClick(t)}
                >${t.summary}</div>
              `)}
            </div>
          </div>
        `:W}

        <div class="column-headers">
          <div class="header-gutter"></div>
          ${l.map(t=>{const e=s.find(e=>(e.person_entity||e.entity_id)===t),i=e?.person_entity?xt(this.hass,e.person_entity):null,a=e?.person_entity?bt(this.hass,e.person_entity):e?.display_name||t;return R`
              <div class="person-header">
                ${i?R`<img class="person-avatar" src="${i}" alt="${a}" />`:R`<div class="person-initial" style="background: ${e?.color||"#6366F1"}">${a[0]?.toUpperCase()||"?"}</div>`}
                <span class="person-name">${a}</span>
              </div>
            `})}
        </div>

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="columns-area">
              ${this._renderHourLines()}
              ${h>=0&&h<=100?R`
                <div class="pv-now-line" style="top: ${h}%"></div>
              `:W}
              ${l.map(t=>this._renderColumn(t,o.get(t)||[]))}
            </div>
          </div>
        </div>
      </div>
    `}_renderTimeLabels(){const t=[];for(let e=6;e<=23;e++){const i=(e-6)/17*100;let a;a="24h"===this.timeFormat?`${String(e).padStart(2,"0")}:00`:`${e%12||12} ${e>=12?"PM":"AM"}`,t.push(R`
        <div class="time-label" style="top: ${i}%">${a}</div>
      `)}return t}_renderHourLines(){const t=[];for(let e=6;e<=23;e++){const i=(e-6)/17*100;t.push(R`
        <div class="hour-line" style="top: ${i}%"></div>
      `)}return t}_renderColumn(t,e){const i=Vt(e);return R`
      <div class="person-column">
        ${i.map(t=>{const e=It(t,6,23),i=t.totalColumns>1?`calc(${100/t.totalColumns}% - 4px)`:"calc(100% - 4px)",a=t.totalColumns>1?`calc(${t.column/t.totalColumns*100}% + 2px)`:"2px";return R`
            <div
              class="positioned-event"
              style="
                top: ${e.top}%;
                height: ${e.height}%;
                width: ${i};
                left: ${a};
                --event-color: ${t.calendar_color};
              "
              @click=${()=>this._onEventClick(t)}
            >
              <div class="event-title">${t.summary}</div>
              <div class="event-time">${wt(t.start,this.timeFormat)}</div>
            </div>
          `})}
      </div>
    `}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}};Yt.styles=[zt,Bt,Ut,Ot,o`
      :host { display: block; }

      .day-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* All-day section */
      .all-day-section {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        padding: 0.5rem 0;
        min-height: 40px;
        flex-shrink: 0;
      }

      .all-day-gutter {
        width: 60px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      .all-day-events {
        flex: 1;
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
        padding: 0 0.5rem;
      }

      .all-day-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        color: white;
        cursor: pointer;
        transition: all var(--pv-transition);
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .all-day-chip:hover {
        transform: scale(1.02);
        box-shadow: var(--pv-shadow);
      }

      /* Column headers */
      .column-headers {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .header-gutter {
        width: 60px;
        flex-shrink: 0;
      }

      .person-header {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 0.5rem;
        min-width: 0;
      }

      .person-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 2px solid var(--pv-border-subtle);
      }

      .person-initial {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
        flex-shrink: 0;
      }

      .person-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Time grid */
      .time-grid-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
      }

      .time-grid {
        display: flex;
        position: relative;
        min-height: ${1020}px;
      }

      .time-gutter {
        width: 60px;
        flex-shrink: 0;
        position: relative;
      }

      .time-label {
        position: absolute;
        right: 0.5rem;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        transform: translateY(-50%);
        font-variant-numeric: tabular-nums;
      }

      .columns-area {
        flex: 1;
        display: flex;
        position: relative;
      }

      .person-column {
        flex: 1;
        position: relative;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .person-column:first-child {
        border-left: 1px solid var(--pv-border);
      }

      /* Hour lines */
      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--pv-border-subtle);
        pointer-events: none;
      }

      /* Positioned events */
      .positioned-event {
        position: absolute;
        left: 2px;
        right: 2px;
        padding: 0.25rem 0.375rem;
        border-radius: var(--pv-radius-sm, 8px);
        border-left: 3px solid var(--event-color);
        background: color-mix(in srgb, var(--event-color) 10%, var(--pv-card-bg, white));
        cursor: pointer;
        overflow: hidden;
        transition: all var(--pv-transition);
        z-index: 1;
        min-height: 24px;
      }

      .positioned-event:hover {
        z-index: 5;
        box-shadow: var(--pv-shadow-lg);
        transform: translateX(1px);
      }

      .positioned-event .event-title {
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positioned-event .event-time {
        font-size: 0.625rem;
        color: var(--pv-text-secondary);
        margin-top: 1px;
      }

      /* Click target for empty slots */
      .slot-click-area {
        position: absolute;
        left: 0;
        right: 0;
        cursor: pointer;
      }

      .slot-click-area:hover {
        background: var(--pv-today-bg);
      }

      /* Empty state */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--pv-text-muted);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
        margin-bottom: 1rem;
      }
    `],t([vt({attribute:!1})],Yt.prototype,"hass",void 0),t([vt({type:Array})],Yt.prototype,"events",void 0),t([vt({type:Array})],Yt.prototype,"calendars",void 0),t([vt({type:Object})],Yt.prototype,"currentDate",void 0),t([vt({type:Object})],Yt.prototype,"hiddenCalendars",void 0),t([vt({attribute:!1})],Yt.prototype,"timeFormat",void 0),Yt=t([ct("pv-view-day")],Yt);let Wt=class extends lt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday"}firstUpdated(){this._scrollToNow()}_scrollToNow(){requestAnimationFrame(()=>{const t=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!t)return;const e=new Date,i=60*(e.getHours()-6)+e.getMinutes();if(i>0&&i<1020){const e=i/1020*t.scrollHeight-t.clientHeight/3;t.scrollTo({top:Math.max(0,e),behavior:"smooth"})}})}_getWeekDays(){const t=kt(this.currentDate,this.firstDay);return Array.from({length:7},(e,i)=>{const a=new Date(t);return a.setDate(a.getDate()+i),a})}render(){const t=Rt(this.events,this.hiddenCalendars),e=this._getWeekDays(),i=new Date(e[0]);i.setHours(0,0,0,0);const a=new Date(e[6]);a.setHours(23,59,59,999);const n=Nt(t,i,a),r=(new Date).toDateString();return R`
      <div class="week-container">
        <div class="day-headers">
          <div class="header-gutter"></div>
          ${e.map(t=>{const e=t.toDateString()===r;return R`
              <div class="day-header ${e?"today":""}">
                <div class="day-header-weekday">${t.toLocaleDateString("en-US",{weekday:"short"})}</div>
                <div class="day-header-date">${t.getDate()}</div>
              </div>
            `})}
        </div>

        ${this._renderAllDayBanner(e,n)}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="days-area">
              ${this._renderHourLines()}
              ${e.map(t=>this._renderDayColumn(t,n,r))}
            </div>
          </div>
        </div>
      </div>
    `}_renderAllDayBanner(t,e){const i=e.filter(t=>jt(t));return 0===i.length?W:R`
      <div class="all-day-banner">
        <div class="all-day-gutter">All Day</div>
        ${t.map(t=>{const e=new Date(t);e.setHours(0,0,0,0);const a=new Date(t);a.setHours(23,59,59,999);const n=i.filter(t=>{const i=new Date(t.start),n=new Date(t.end);return i<a&&n>e});return R`
            <div class="all-day-column">
              ${n.map(t=>R`
                <div
                  class="all-day-event"
                  style="background: ${t.calendar_color}"
                  @click=${()=>this._onEventClick(t)}
                >${t.summary}</div>
              `)}
            </div>
          `})}
      </div>
    `}_renderTimeLabels(){const t=[];for(let e=6;e<=23;e++){const i=(e-6)/17*100;let a;a="24h"===this.timeFormat?`${String(e).padStart(2,"0")}:00`:`${e%12||12} ${e>=12?"PM":"AM"}`,t.push(R`<div class="time-label" style="top: ${i}%">${a}</div>`)}return t}_renderHourLines(){const t=[];for(let e=6;e<=23;e++){const i=(e-6)/17*100;t.push(R`<div class="hour-line" style="top: ${i}%"></div>`)}return t}_renderDayColumn(t,e,i){const a=t.toDateString()===i,n=new Date(t);n.setHours(6,0,0,0);const r=new Date(t);r.setHours(23,0,0,0);const s=e.filter(e=>{if(jt(e))return!1;const i=new Date(e.start),a=new Date(e.end);return i<r&&a>n&&i.toDateString()===t.toDateString()}),o=Vt(s),l=new Date,d=60*(l.getHours()-6)+l.getMinutes(),c=a?d/1020*100:-1;return R`
      <div class="day-column ${a?"today":""}">
        ${c>=0&&c<=100?R`
          <div class="pv-now-line" style="top: ${c}%"></div>
        `:W}
        ${o.map(t=>{const e=It(t,6,23),i=t.totalColumns>1?`calc(${100/t.totalColumns}% - 3px)`:"calc(100% - 4px)",a=t.totalColumns>1?`calc(${t.column/t.totalColumns*100}% + 2px)`:"2px";return R`
            <div
              class="positioned-event"
              style="top:${e.top}%;height:${e.height}%;width:${i};left:${a};--event-color:${t.calendar_color}"
              @click=${()=>this._onEventClick(t)}
            >
              <div class="event-title">${t.summary}</div>
              <div class="event-time">${wt(t.start,this.timeFormat)}</div>
            </div>
          `})}
      </div>
    `}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}};Wt.styles=[zt,Bt,Ut,o`
      :host { display: block; }

      .week-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* Day headers */
      .day-headers {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .header-gutter {
        width: 54px;
        flex-shrink: 0;
      }

      .day-header {
        flex: 1;
        text-align: center;
        padding: 0.5rem 0.25rem;
        min-width: 0;
      }

      .day-header-weekday {
        font-size: 0.6875rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted);
      }

      .day-header-date {
        font-size: 1.25rem;
        font-weight: 300;
        margin-top: 0.125rem;
        color: var(--pv-text);
      }

      .day-header.today .day-header-date {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
      }

      .day-header.today .day-header-weekday {
        color: var(--pv-accent);
        font-weight: 600;
      }

      /* All-day banner */
      .all-day-banner {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        min-height: 28px;
        flex-shrink: 0;
      }

      .all-day-gutter {
        width: 54px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        text-transform: uppercase;
        font-weight: 500;
      }

      .all-day-column {
        flex: 1;
        padding: 0.25rem 2px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .all-day-event {
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        font-size: 0.6875rem;
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        transition: opacity 150ms;
      }

      .all-day-event:hover { opacity: 0.85; }

      /* Time grid */
      .time-grid-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .time-grid {
        display: flex;
        position: relative;
        min-height: ${1020}px;
      }

      .time-gutter {
        width: 54px;
        flex-shrink: 0;
        position: relative;
      }

      .time-label {
        position: absolute;
        right: 0.375rem;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        transform: translateY(-50%);
        font-variant-numeric: tabular-nums;
      }

      .days-area {
        flex: 1;
        display: flex;
        position: relative;
      }

      .day-column {
        flex: 1;
        position: relative;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .day-column.today {
        background: var(--pv-today-bg);
      }

      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--pv-border-subtle);
        pointer-events: none;
      }

      /* Events */
      .positioned-event {
        position: absolute;
        left: 2px;
        right: 2px;
        padding: 0.125rem 0.25rem;
        border-radius: 4px;
        border-left: 3px solid var(--event-color);
        background: color-mix(in srgb, var(--event-color) 12%, var(--pv-card-bg, white));
        cursor: pointer;
        overflow: hidden;
        transition: all var(--pv-transition);
        z-index: 1;
        font-size: 0.6875rem;
        min-height: 18px;
      }

      .positioned-event:hover {
        z-index: 5;
        box-shadow: var(--pv-shadow);
      }

      .positioned-event .event-title {
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positioned-event .event-time {
        font-size: 0.5625rem;
        color: var(--pv-text-secondary);
      }
    `],t([vt({attribute:!1})],Wt.prototype,"hass",void 0),t([vt({type:Array})],Wt.prototype,"events",void 0),t([vt({type:Array})],Wt.prototype,"calendars",void 0),t([vt({type:Object})],Wt.prototype,"currentDate",void 0),t([vt({type:Object})],Wt.prototype,"hiddenCalendars",void 0),t([vt({attribute:!1})],Wt.prototype,"timeFormat",void 0),t([vt({attribute:!1})],Wt.prototype,"firstDay",void 0),Wt=t([ct("pv-view-week")],Wt);const qt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Qt=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];let Zt=class extends lt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday"}render(){const t=Rt(this.events,this.hiddenCalendars),e=function(t,e="sunday"){const i=kt(new Date(t.getFullYear(),t.getMonth(),1),e),a=[];for(let t=0;t<42;t++){const e=new Date(i);e.setDate(i.getDate()+t),a.push(e)}return a}(this.currentDate,this.firstDay),i=Lt(t),a=this.currentDate.getMonth(),n="monday"===this.firstDay?Qt:qt;return R`
      <div class="month-container">
        <div class="weekday-header">
          ${n.map(t=>R`<div class="weekday-name">${t}</div>`)}
        </div>
        <div class="month-grid">
          ${e.map(t=>this._renderDayCell(t,a,i))}
        </div>
      </div>
    `}_renderDayCell(t,e,i){const a=Ct(t),n=i.get(a)||[],r=t.getMonth()!==e,s=$t(t),o=n.slice(0,3),l=n.length-3;return R`
      <div
        class="day-cell ${r?"other-month":""} ${s?"today":""}"
        @click=${()=>this._onDayClick(t)}
      >
        <div class="day-number">${t.getDate()}</div>
        <div class="day-events">
          ${o.map(t=>R`
            <div
              class="month-event-pill"
              style="background: ${t.calendar_color}"
              @click=${e=>{e.stopPropagation(),this._onEventClick(t)}}
            >${t.summary}</div>
          `)}
          ${l>0?R`
            <div class="more-events" @click=${e=>{e.stopPropagation(),this._onDayClick(t)}}>
              +${l} more
            </div>
          `:W}
        </div>
      </div>
    `}_onDayClick(t){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:t},bubbles:!0,composed:!0}))}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}};Zt.styles=[zt,Bt,o`
      :host { display: block; }

      .month-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .weekday-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .weekday-name {
        text-align: center;
        padding: 0.5rem 0;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted);
      }

      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(6, 1fr);
        flex: 1;
        min-height: 0;
      }

      .day-cell {
        border-right: 1px solid var(--pv-border-subtle);
        border-bottom: 1px solid var(--pv-border-subtle);
        padding: 0.25rem;
        min-height: 0;
        overflow: hidden;
        cursor: pointer;
        transition: background 150ms ease;
      }

      .day-cell:hover {
        background: var(--pv-event-hover);
      }

      .day-cell:nth-child(7n) {
        border-right: none;
      }

      .day-cell.other-month {
        opacity: 0.35;
      }

      .day-cell.today {
        background: var(--pv-today-bg);
      }

      .day-number {
        font-size: 0.8125rem;
        font-weight: 400;
        color: var(--pv-text);
        margin-bottom: 0.125rem;
        padding: 0.125rem 0.25rem;
        display: inline-block;
      }

      .day-cell.today .day-number {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .month-event-pill {
        padding: 0.0625rem 0.375rem;
        border-radius: 3px;
        font-size: 0.625rem;
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        line-height: 1.4;
        transition: opacity 150ms;
      }

      .month-event-pill:hover {
        opacity: 0.85;
      }

      .more-events {
        font-size: 0.625rem;
        color: var(--pv-text-secondary);
        padding: 0 0.375rem;
        cursor: pointer;
        font-weight: 500;
      }

      .more-events:hover {
        color: var(--pv-accent);
      }
    `],t([vt({attribute:!1})],Zt.prototype,"hass",void 0),t([vt({type:Array})],Zt.prototype,"events",void 0),t([vt({type:Array})],Zt.prototype,"calendars",void 0),t([vt({type:Object})],Zt.prototype,"currentDate",void 0),t([vt({type:Object})],Zt.prototype,"hiddenCalendars",void 0),t([vt({attribute:!1})],Zt.prototype,"firstDay",void 0),Zt=t([ct("pv-view-month")],Zt);let Xt=class extends lt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.maxEvents=20,this.daysAhead=14,this.showCalendarName=!0,this.showEndTime=!1}render(){const t=Rt(this.events,this.hiddenCalendars),e=new Date(this.currentDate);e.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setDate(i.getDate()+this.daysAhead),i.setHours(23,59,59,999);const a=Nt(t,e,i),n=Lt(a),r=Array.from(n.keys()).sort();let s=0;const o=this.maxHeight?`max-height: ${this.maxHeight}`:"";return 0===a.length?R`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-check"></ha-icon>
          <p>No upcoming events</p>
        </div>
      `:R`
      <div class="agenda-container" style="${o}">
        ${r.map(t=>{if(s>=this.maxEvents)return W;const e=n.get(t)||[],i=new Date(t+"T00:00:00"),a=function(t){if($t(t))return"Today";if(function(t){const e=new Date;return e.setDate(e.getDate()+1),t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}(t))return"Tomorrow";const e=new Date,i=Math.floor((t.getTime()-e.getTime())/864e5);return i<7&&i>=0?t.toLocaleDateString("en-US",{weekday:"long"}):_t(t,"medium")}(i),r=_t(i,"medium"),o=$t(i),l=function(t){const e=new Date;e.setHours(0,0,0,0);const i=new Date(t);return i.setHours(0,0,0,0),i<e}(i)&&!o;return R`
            <div class="date-group" style="${l?"opacity: 0.6":""}">
              <div class="date-header ${o?"today":""}">
                <span class="date-header-relative">${a}</span>
                ${a!==r?R`<span class="date-header-full">${r}</span>`:W}
              </div>
              ${e.map(t=>s>=this.maxEvents?W:(s++,this._renderEvent(t)))}
            </div>
          `})}
      </div>
    `}_renderEvent(t){const e=jt(t),i=e?null:wt(t.start,this.timeFormat),a=e||!this.showEndTime?null:wt(t.end,this.timeFormat);return R`
      <div class="agenda-event" @click=${()=>this._onEventClick(t)}>
        <div class="event-color-bar" style="background: ${t.calendar_color}"></div>
        <div class="event-content">
          <div class="event-title">${t.summary}</div>
          <div class="event-meta">
            ${e?R`<span class="all-day-label">All Day</span>`:R`
                <span class="event-time-text">
                  ${i}${a?R` – ${a}`:W}
                </span>
              `}
            ${this.showCalendarName?R`
              <span class="event-calendar-name">
                <span class="calendar-dot" style="background: ${t.calendar_color}"></span>
                ${t.calendar_name}
              </span>
            `:W}
          </div>
          ${t.location?R`
            <div class="event-location">
              <ha-icon icon="mdi:map-marker-outline"></ha-icon>
              ${t.location}
            </div>
          `:W}
        </div>
      </div>
    `}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}};Xt.styles=[zt,Bt,Ot,o`
      :host { display: block; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }

      .date-group {
        animation: pv-fadeIn 200ms ease;
      }

      .date-header {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 0.625rem 1rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-text);
        background: var(--pv-card-bg, #fff);
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .date-header.today {
        color: var(--pv-accent);
      }

      .date-header-relative {
        font-weight: 600;
      }

      .date-header-full {
        font-weight: 400;
        color: var(--pv-text-secondary);
        margin-left: 0.5rem;
      }

      .agenda-event {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background var(--pv-transition, 200ms ease);
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .agenda-event:hover {
        background: var(--pv-event-hover);
      }

      .agenda-event:active {
        background: color-mix(in srgb, var(--pv-event-hover) 150%, transparent);
      }

      .event-color-bar {
        width: 4px;
        min-height: 36px;
        border-radius: 2px;
        flex-shrink: 0;
        align-self: stretch;
      }

      .event-content {
        flex: 1;
        min-width: 0;
      }

      .event-title {
        font-size: 0.9375rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--pv-text);
      }

      .event-meta {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.25rem;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
      }

      .event-time-text {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .event-calendar-name {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .calendar-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .event-location {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        margin-top: 0.25rem;
      }

      .event-location ha-icon {
        --mdc-icon-size: 14px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        color: var(--pv-text-muted);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
        margin-bottom: 1rem;
      }

      .all-day-label {
        font-weight: 500;
        color: var(--pv-accent);
        font-size: 0.75rem;
      }
    `],t([vt({attribute:!1})],Xt.prototype,"hass",void 0),t([vt({type:Array})],Xt.prototype,"events",void 0),t([vt({type:Array})],Xt.prototype,"calendars",void 0),t([vt({type:Object})],Xt.prototype,"currentDate",void 0),t([vt({type:Object})],Xt.prototype,"hiddenCalendars",void 0),t([vt({attribute:!1})],Xt.prototype,"timeFormat",void 0),t([vt({type:Number})],Xt.prototype,"maxEvents",void 0),t([vt({type:Number})],Xt.prototype,"daysAhead",void 0),t([vt({type:Boolean})],Xt.prototype,"showCalendarName",void 0),t([vt({type:Boolean})],Xt.prototype,"showEndTime",void 0),t([vt({attribute:!1})],Xt.prototype,"maxHeight",void 0),Xt=t([ct("pv-view-agenda")],Xt);let Jt=class extends lt{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleting=!1,this._pv=new Ft(this)}render(){if(!this.event)return W;const t=this.event,e=jt(t),i=new Date(t.start);return R`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${t=>t.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${t.summary}</h3>
            <div class="popup-calendar">
              <span class="calendar-indicator" style="background: ${t.calendar_color}"></span>
              ${t.calendar_name}
            </div>
          </div>

          <div class="popup-body">
            <div class="detail-row">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
              <div class="detail-text">
                <div>${_t(i,"long")}</div>
                ${e?R`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:R`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${wt(t.start,this.timeFormat)} – ${wt(t.end,this.timeFormat)}
                  </div>
                `}
              </div>
            </div>

            ${t.location?R`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${t.location}</div>
              </div>
            `:W}

            ${t.description?R`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${t.description}</div>
              </div>
            `:W}
          </div>

          ${this._confirmDelete?R`
            <div class="delete-confirm">
              <div class="delete-confirm-text">
                Delete "${t.summary}"?
              </div>
              <div class="delete-confirm-actions">
                <button class="pv-btn pv-btn-secondary" @click=${()=>this._confirmDelete=!1}>
                  Cancel
                </button>
                <button class="pv-btn btn-delete" ?disabled=${this._deleting} @click=${this._delete}>
                  ${this._deleting?"Deleting...":"Delete"}
                </button>
              </div>
            </div>
          `:R`
            <div class="popup-actions">
              <button class="pv-btn pv-btn-secondary" @click=${this._edit}>
                <ha-icon icon="mdi:pencil-outline"></ha-icon>
                Edit
              </button>
              <button class="pv-btn pv-btn-secondary" style="color: #EF4444; border-color: #FCA5A5;"
                @click=${()=>this._confirmDelete=!0}>
                <ha-icon icon="mdi:delete-outline"></ha-icon>
                Delete
              </button>
            </div>
          `}
        </div>
      </div>
    `}_close(){this._confirmDelete=!1,this._deleting=!1,this._pv.state.selectEvent(null)}_edit(){this.event&&this._pv.state.openEditDialog(this.event)}async _delete(){if(this.event?.uid){this._deleting=!0;try{const t={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this._pv.state.doDeleteEvent(this.hass,t)}catch(t){console.error("PlanaVista: Delete failed",t),this._deleting=!1}}else console.warn("PlanaVista: Cannot delete event without UID")}};Jt.styles=[zt,Mt,Ht,Ot,o`
      :host { display: block; }

      .popup-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .popup-title {
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1.3;
        color: var(--pv-text);
        margin: 0;
      }

      .popup-calendar {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-top: 0.375rem;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
      }

      .calendar-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .popup-body {
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: 0.9375rem;
        color: var(--pv-text);
      }

      .detail-row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .detail-text {
        flex: 1;
        min-width: 0;
        line-height: 1.4;
      }

      .detail-label {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.125rem;
      }

      .popup-actions {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--pv-border-subtle);
      }

      .popup-actions .pv-btn {
        flex: 1;
      }

      .delete-confirm {
        padding: 0.75rem 1.5rem;
        background: color-mix(in srgb, #EF4444 6%, transparent);
        border-top: 1px solid color-mix(in srgb, #EF4444 15%, transparent);
      }

      .delete-confirm-text {
        font-size: 0.875rem;
        color: #B91C1C;
        margin-bottom: 0.75rem;
        font-weight: 500;
      }

      .delete-confirm-actions {
        display: flex;
        gap: 0.75rem;
      }

      .btn-delete {
        background: #EF4444;
        color: white;
      }

      .btn-delete:hover {
        background: #DC2626;
      }

      .close-btn {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
      }
    `],t([vt({attribute:!1})],Jt.prototype,"hass",void 0),t([vt({type:Object})],Jt.prototype,"event",void 0),t([vt({attribute:!1})],Jt.prototype,"timeFormat",void 0),t([gt()],Jt.prototype,"_confirmDelete",void 0),t([gt()],Jt.prototype,"_deleting",void 0),Jt=t([ct("pv-event-popup")],Jt);let Kt=class extends lt{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this._title="",this._calendarEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._pv=new Ft(this)}updated(t){super.updated(t),t.has("open")&&this.open&&(this._initForm(),requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this.prefill){if(this._title=this.prefill.summary||"",this._calendarEntityId=this.prefill.calendar_entity_id||this.calendars[0]?.entity_id||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"",this.prefill.start){const t=new Date(this.prefill.start);this._date=this._toDateStr(t),!this.prefill.start.includes("T")||0===t.getHours()&&0===t.getMinutes()?(this._allDay=!0,this._startTime="",this._endTime=""):(this._allDay=!1,this._startTime=this._toTimeStr(t),this.prefill.end&&(this._endTime=this._toTimeStr(new Date(this.prefill.end))))}else this._setDefaults();(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}_setDefaults(){this._title="",this._calendarEntityId=this.calendars[0]?.entity_id||"";const t=new Date;this._date=this._toDateStr(t);const e=15*Math.ceil(t.getMinutes()/15);t.setMinutes(e,0,0),this._startTime=this._toTimeStr(t);const i=new Date(t);i.setHours(i.getHours()+1),this._endTime=this._toTimeStr(i),this._allDay=!1,this._description="",this._location=""}_toDateStr(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}_toTimeStr(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}render(){if(!this.open)return W;const t=this.calendars.filter(t=>!1!==t.visible),e="edit"===this.mode,i=e?"Edit Event":"New Event";return R`
      <div class="pv-overlay" @click=${this._onOverlayClick}>
        <div class="pv-dialog" @click=${t=>t.stopPropagation()}>
          <div class="pv-dialog-header">
            <span class="pv-heading-2">${i}</span>
            <button class="pv-btn-icon" @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="pv-dialog-body">
            <div class="form-grid">
              ${this._error?R`<div class="error-msg">${this._error}</div>`:W}

              <div class="form-field">
                <input
                  id="title-input"
                  class="pv-input"
                  type="text"
                  placeholder="Event title"
                  .value=${this._title}
                  @input=${t=>this._title=t.target.value}
                />
              </div>

              <div class="form-field">
                <label class="pv-label">Calendar</label>
                <div class="calendar-select">
                  ${t.map(t=>R`
                    <button
                      class="cal-option ${this._calendarEntityId===t.entity_id?"selected":""}"
                      style="${this._calendarEntityId===t.entity_id?`background: ${t.color}; --cal-bg: ${t.color}`:`--cal-bg: ${t.color}`}"
                      @click=${()=>this._calendarEntityId=t.entity_id}
                    >
                      <span class="cal-dot" style="background: ${t.color}"></span>
                      ${t.display_name}
                    </button>
                  `)}
                </div>
              </div>

              <div class="form-field">
                <label class="pv-label">Date</label>
                <input
                  class="pv-input"
                  type="date"
                  .value=${this._date}
                  @input=${t=>this._date=t.target.value}
                />
              </div>

              <div class="all-day-row">
                <span class="all-day-label">All Day</span>
                <div
                  class="pv-toggle ${this._allDay?"active":""}"
                  @click=${()=>this._allDay=!this._allDay}
                ></div>
              </div>

              ${this._allDay?W:R`
                <div class="form-row">
                  <div class="form-field">
                    <label class="pv-label">Start Time</label>
                    <input
                      class="pv-input"
                      type="time"
                      .value=${this._startTime}
                      @input=${t=>this._startTime=t.target.value}
                    />
                  </div>
                  <div class="form-field">
                    <label class="pv-label">End Time</label>
                    <input
                      class="pv-input"
                      type="time"
                      .value=${this._endTime}
                      @input=${t=>this._endTime=t.target.value}
                    />
                  </div>
                </div>
              `}

              ${this._showMore?R`
                <div class="form-field">
                  <label class="pv-label">Description</label>
                  <textarea
                    class="pv-input"
                    rows="3"
                    placeholder="Add a description..."
                    .value=${this._description}
                    @input=${t=>this._description=t.target.value}
                    style="resize: vertical; min-height: 80px;"
                  ></textarea>
                </div>
                <div class="form-field">
                  <label class="pv-label">Location</label>
                  <input
                    class="pv-input"
                    type="text"
                    placeholder="Add a location..."
                    .value=${this._location}
                    @input=${t=>this._location=t.target.value}
                  />
                </div>
              `:R`
                <button class="show-more-btn" @click=${()=>this._showMore=!0}>
                  + Add description, location
                </button>
              `}
            </div>
          </div>

          <div class="pv-dialog-footer">
            <button class="pv-btn pv-btn-secondary" @click=${this._close}>
              Cancel
            </button>
            <button
              class="pv-btn pv-btn-primary"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving?"Saving...":e?"Save Changes":"Create Event"}
            </button>
          </div>
        </div>
      </div>
    `}_onOverlayClick(){this._close()}_close(){this._pv.state.closeDialog()}async _save(){if(this._title.trim())if(this._calendarEntityId){this._error="",this._saving=!0;try{const t={entity_id:this._calendarEntityId,summary:this._title.trim()};if(this._allDay){t.start_date=this._date;const e=new Date(this._date);e.setDate(e.getDate()+1),t.end_date=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}else t.start_date_time=`${this._date}T${this._startTime}:00`,t.end_date_time=`${this._date}T${this._endTime}:00`;if(this._description.trim()&&(t.description=this._description.trim()),this._location.trim()&&(t.location=this._location.trim()),"edit"===this.mode&&this.prefill?.uid){const e={entity_id:this.prefill.calendar_entity_id,uid:this.prefill.uid,recurrence_id:this.prefill.recurrence_id};await this._pv.state.doEditEvent(this.hass,e,t)}else await this._pv.state.doCreateEvent(this.hass,t)}catch(t){this._error=`Failed to save event: ${t?.message||"Unknown error"}`,this._saving=!1}}else this._error="Please select a calendar";else this._error="Please enter an event title"}};Kt.styles=[zt,Mt,Pt,Ht,Ot,o`
      :host { display: block; }

      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
      }

      .form-row > * {
        flex: 1;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .all-day-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
      }

      .all-day-label {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pv-text);
      }

      .calendar-select {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .cal-option {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border: 2px solid transparent;
        border-radius: 9999px;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-size: 0.8125rem;
        font-weight: 500;
        background: transparent;
        font-family: inherit;
        min-height: 40px;
      }

      .cal-option.selected {
        color: white;
        box-shadow: 0 2px 6px color-mix(in srgb, var(--cal-bg) 30%, transparent);
      }

      .cal-option:not(.selected) {
        border-color: var(--pv-border);
        color: var(--pv-text-secondary);
      }

      .cal-option:hover:not(.selected) {
        border-color: var(--pv-text-muted);
      }

      .cal-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .show-more-btn {
        background: none;
        border: none;
        color: var(--pv-text-secondary);
        font-size: 0.8125rem;
        cursor: pointer;
        padding: 0.5rem 0;
        font-family: inherit;
        text-align: left;
      }

      .show-more-btn:hover {
        color: var(--pv-accent);
      }

      .error-msg {
        color: #EF4444;
        font-size: 0.8125rem;
        padding: 0.5rem;
        background: color-mix(in srgb, #EF4444 8%, transparent);
        border-radius: var(--pv-radius-sm);
      }
    `],t([vt({attribute:!1})],Kt.prototype,"hass",void 0),t([vt({type:Array})],Kt.prototype,"calendars",void 0),t([vt({type:Boolean})],Kt.prototype,"open",void 0),t([vt({type:String})],Kt.prototype,"mode",void 0),t([vt({type:Object})],Kt.prototype,"prefill",void 0),t([gt()],Kt.prototype,"_title",void 0),t([gt()],Kt.prototype,"_calendarEntityId",void 0),t([gt()],Kt.prototype,"_date",void 0),t([gt()],Kt.prototype,"_startTime",void 0),t([gt()],Kt.prototype,"_endTime",void 0),t([gt()],Kt.prototype,"_allDay",void 0),t([gt()],Kt.prototype,"_description",void 0),t([gt()],Kt.prototype,"_location",void 0),t([gt()],Kt.prototype,"_showMore",void 0),t([gt()],Kt.prototype,"_saving",void 0),t([gt()],Kt.prototype,"_error",void 0),t([(t,e,i)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(t,e,{get(){return(t=>t.renderRoot?.querySelector("#title-input")??null)(this)}})],Kt.prototype,"_titleInput",void 0),Kt=t([ct("pv-event-create-dialog")],Kt);let Gt=class extends lt{constructor(){super(...arguments),this._pv=new Ft(this),this._touchStartX=0}setConfig(t){this._config={entity:"sensor.planavista_config",...t},t.view&&this._pv.state.setView(t.view)}connectedCallback(){if(super.connectedCallback(),!this._config?.view){const t=this.hass?yt(this.hass,this._config?.entity):null;t?.display?.default_view&&this._pv.state.setView(t.display.default_view)}}updated(t){if(super.updated(t),t.has("hass")||t.has("_config")){const t=yt(this.hass,this._config?.entity);Et(this,St(this._config?.theme,t?.display?.theme))}}_getData(){return yt(this.hass,this._config?.entity)}render(){if(!this._config||!this.hass)return W;const t=this._getData();if(!t)return R`
        <ha-card>
          <div style="padding: 2rem; text-align: center; color: var(--pv-text-muted);">
            <p>PlanaVista entity not found</p>
          </div>
        </ha-card>
      `;const e=this._pv.state,i=e.currentView,a=e.currentDate,n=t.calendars||[],r=t.events||[],s=t.display,o=Rt(r,e.hiddenCalendars);let l="";switch(i){case"day":l=_t(a,"long");break;case"week":l=_t(a,"medium");break;case"month":l=a.toLocaleDateString("en-US",{month:"long",year:"numeric"});break;case"agenda":l="Upcoming"}return R`
      <ha-card>
        <div class="nav-header">
          <div class="nav-left">
            <button class="nav-btn" @click=${()=>e.navigateDate("prev")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="today-btn" @click=${()=>e.navigateDate("today")}>Today</button>
            <button class="nav-btn" @click=${()=>e.navigateDate("next")}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <span class="nav-title">${l}</span>

          <div class="view-tabs">
            ${["day","week","month"].map(t=>R`
              <button
                class="view-tab ${i===t?"active":""}"
                @click=${()=>e.setView(t)}
              >${t}</button>
            `)}
          </div>
        </div>

        <div class="view-container"
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @event-click=${this._onEventClick}
          @day-click=${this._onDayClick}
        >
          ${this._renderView(i,o,n,s)}
        </div>

        ${e.selectedEvent?R`
          <pv-event-popup
            .hass=${this.hass}
            .event=${e.selectedEvent}
            .timeFormat=${s?.time_format||"12h"}
          ></pv-event-popup>
        `:W}

        ${e.dialogOpen?R`
          <pv-event-create-dialog
            .hass=${this.hass}
            .calendars=${n}
            .open=${!0}
            .mode=${e.dialogOpen}
            .prefill=${e.createPrefill}
          ></pv-event-create-dialog>
        `:W}
      </ha-card>
    `}_renderView(t,e,i,a){const n=a?.time_format||"12h",r=a?.first_day||"sunday",s=this._pv.state.currentDate,o=this._pv.state.hiddenCalendars;switch(t){case"day":return R`<pv-view-day
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${n}
        ></pv-view-day>`;case"week":return R`<pv-view-week
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${n}
          .firstDay=${r}
        ></pv-view-week>`;case"month":return R`<pv-view-month
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .firstDay=${r}
        ></pv-view-month>`;case"agenda":return R`<pv-view-agenda
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${n}
        ></pv-view-agenda>`;default:return W}}_onEventClick(t){this._pv.state.selectEvent(t.detail.event)}_onDayClick(t){this._pv.state.setDate(t.detail.date),this._pv.state.setView("day")}_onTouchStart(t){this._touchStartX=t.touches[0].clientX}_onTouchEnd(t){const e=t.changedTouches[0].clientX-this._touchStartX;Math.abs(e)>50&&this._pv.state.navigateDate(e>0?"prev":"next")}getCardSize(){return 8}static getStubConfig(){return{entity:"sensor.planavista_config",view:"day"}}};Gt.styles=[zt,Mt,Tt,Ot,o`
      :host { display: block; }

      ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
      }

      /* Navigation header */
      .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
        gap: 0.5rem;
      }

      .nav-left {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .nav-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--pv-text);
        min-width: 0;
        white-space: nowrap;
      }

      .nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .nav-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .today-btn {
        padding: 0.25rem 0.75rem;
        border: 1px solid var(--pv-border);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        min-height: 36px;
      }

      .today-btn:hover {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-color: var(--pv-accent);
      }

      .view-tabs {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle);
        border-radius: 8px;
        padding: 2px;
      }

      .view-tab {
        padding: 0.25rem 0.625rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.6875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        text-transform: capitalize;
        min-height: 32px;
      }

      .view-tab.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .view-tab:hover:not(.active) {
        color: var(--pv-text);
      }

      /* View container */
      .view-container {
        flex: 1;
        overflow: hidden;
        position: relative;
        min-height: 400px;
      }

      .view-container > * {
        height: 100%;
      }
    `],t([vt({attribute:!1})],Gt.prototype,"hass",void 0),t([gt()],Gt.prototype,"_config",void 0),Gt=t([ct("planavista-grid-card")],Gt);let te=class extends lt{constructor(){super(...arguments),this._pv=new Ft(this)}setConfig(t){this._config={entity:"sensor.planavista_config",max_events:10,days_ahead:7,show_calendar_name:!0,show_end_time:!1,...t}}updated(t){if(super.updated(t),t.has("hass")||t.has("_config")){const t=yt(this.hass,this._config?.entity);Et(this,St(this._config?.theme,t?.display?.theme))}}render(){if(!this._config||!this.hass)return W;const t=yt(this.hass,this._config.entity);if(!t)return R`<ha-card><div style="padding:1rem;text-align:center;color:var(--pv-text-muted)">No data</div></ha-card>`;const e=Rt(t.events||[],this._pv.state.hiddenCalendars),i=this._config.time_format||t.display?.time_format||"12h";return R`
      <ha-card>
        <div class="agenda-header">
          <span class="agenda-title">Upcoming</span>
          <span class="event-count">${e.length} events</span>
        </div>
        <pv-view-agenda
          .hass=${this.hass}
          .events=${e}
          .calendars=${t.calendars||[]}
          .currentDate=${new Date}
          .hiddenCalendars=${this._pv.state.hiddenCalendars}
          .timeFormat=${i}
          .maxEvents=${this._config.max_events||10}
          .daysAhead=${this._config.days_ahead||7}
          .showCalendarName=${!1!==this._config.show_calendar_name}
          .showEndTime=${!0===this._config.show_end_time}
          .maxHeight=${this._config.max_height||""}
          @event-click=${this._onEventClick}
        ></pv-view-agenda>

        ${this._pv.state.selectedEvent?R`
          <pv-event-popup
            .hass=${this.hass}
            .event=${this._pv.state.selectedEvent}
            .timeFormat=${i}
          ></pv-event-popup>
        `:W}
      </ha-card>
    `}_onEventClick(t){this._pv.state.selectEvent(t.detail.event)}getCardSize(){return 4}static getStubConfig(){return{entity:"sensor.planavista_config",max_events:10,days_ahead:7}}};te.styles=[zt,o`
      :host { display: block; }

      ha-card {
        overflow: hidden;
      }

      .agenda-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .agenda-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .event-count {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 500;
      }
    `],t([vt({attribute:!1})],te.prototype,"hass",void 0),t([gt()],te.prototype,"_config",void 0),te=t([ct("planavista-agenda-card")],te);let ee=class extends lt{constructor(){super(...arguments),this._time="",this._date=""}setConfig(t){this._config={entity:"sensor.planavista_config",size:"large",show_date:!0,show_seconds:!1,time_format:void 0,align:"center",...t}}connectedCallback(){super.connectedCallback(),this._updateTime(),this._timer=setInterval(()=>this._updateTime(),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&(clearInterval(this._timer),this._timer=void 0)}_updateTime(){const t=new Date,e=this._config?.time_format||this._getDisplayConfig()?.time_format||"12h",i=this._config?.show_seconds||!1;if("24h"===e){const e=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0");this._time=i?`${e}:${a}:${n}`:`${e}:${a}`}else{let e=t.getHours();const a=e>=12?"PM":"AM";e=e%12||12;const n=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),s=i?`${e}:${n}:${r}`:`${e}:${n}`;this._time=`${s}|${a}`}!1!==this._config?.show_date&&(this._date=_t(t,"long"))}_getDisplayConfig(){if(!this.hass)return;const t=yt(this.hass,this._config?.entity);return t?.display}updated(t){if(super.updated(t),t.has("hass")||t.has("_config")){const t=this._getDisplayConfig();Et(this,St(this._config?.theme,t?.theme))}}render(){if(!this._config)return W;const t=this._config.size||"large",e=this._config.align||"center",i=`${this._config.background?`background: ${this._config.background};`:""}${this._config.text_color?`color: ${this._config.text_color};`:""}`,a=this._time.split("|"),n=a[0],r=a[1]||"";return R`
      <ha-card style="${i}">
        <div class="clock-container align-${e}">
          <div class="time size-${t}">
            ${n}${r?R`<span class="period">${r}</span>`:W}
          </div>
          ${!1!==this._config.show_date?R`<div class="date">${this._date}</div>`:W}
        </div>
      </ha-card>
    `}getCardSize(){const t=this._config?.size||"large";return"small"===t?2:"medium"===t?3:4}static getConfigElement(){return document.createElement("planavista-clock-card-editor")}static getStubConfig(){return{entity:"sensor.planavista_config",size:"large",show_date:!0}}};ee.styles=[zt,o`
      :host {
        display: block;
      }

      ha-card {
        padding: 1.5rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .clock-container {
        display: flex;
        flex-direction: column;
      }

      .clock-container.align-left { text-align: left; }
      .clock-container.align-center { text-align: center; }
      .clock-container.align-right { text-align: right; }

      .time {
        font-weight: 300;
        line-height: 1.1;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
      }

      .time.size-small { font-size: 2rem; }
      .time.size-medium { font-size: 3.5rem; }
      .time.size-large { font-size: 5rem; }

      .time .period {
        font-size: 0.35em;
        font-weight: 400;
        letter-spacing: 0.02em;
        opacity: 0.7;
        margin-left: 0.15em;
        vertical-align: super;
      }

      .date {
        font-size: 1rem;
        font-weight: 400;
        margin-top: 0.5rem;
        opacity: 0.85;
      }

      .time.size-large + .date { font-size: 1.25rem; margin-top: 0.75rem; }
      .time.size-small + .date { font-size: 0.875rem; margin-top: 0.25rem; }
    `],t([vt({attribute:!1})],ee.prototype,"hass",void 0),t([gt()],ee.prototype,"_config",void 0),t([gt()],ee.prototype,"_time",void 0),t([gt()],ee.prototype,"_date",void 0),ee=t([ct("planavista-clock-card")],ee);let ie=class extends lt{setConfig(t){this._config=t}render(){return this._config?R`
      <div class="editor">
        <div class="row">
          <label>Size</label>
          <select @change=${t=>this._changed("size",t.target.value)}>
            <option value="small" ?selected=${"small"===this._config.size}>Small</option>
            <option value="medium" ?selected=${"medium"===this._config.size}>Medium</option>
            <option value="large" ?selected=${"large"===this._config.size}>Large</option>
          </select>
        </div>
        <div class="row">
          <label>Time Format</label>
          <select @change=${t=>this._changed("time_format",t.target.value)}>
            <option value="" ?selected=${!this._config.time_format}>Auto</option>
            <option value="12h" ?selected=${"12h"===this._config.time_format}>12h</option>
            <option value="24h" ?selected=${"24h"===this._config.time_format}>24h</option>
          </select>
        </div>
        <div class="row">
          <label>Alignment</label>
          <select @change=${t=>this._changed("align",t.target.value)}>
            <option value="left" ?selected=${"left"===this._config.align}>Left</option>
            <option value="center" ?selected=${"center"===this._config.align}>Center</option>
            <option value="right" ?selected=${"right"===this._config.align}>Right</option>
          </select>
        </div>
        <div class="row">
          <label>Show Date</label>
          <input type="checkbox" ?checked=${!1!==this._config.show_date}
            @change=${t=>this._changed("show_date",t.target.checked)} />
        </div>
        <div class="row">
          <label>Show Seconds</label>
          <input type="checkbox" ?checked=${!0===this._config.show_seconds}
            @change=${t=>this._changed("show_seconds",t.target.checked)} />
        </div>
        <div class="row">
          <label>Background</label>
          <input type="text" .value=${this._config.background||""}
            placeholder="e.g. linear-gradient(...)"
            @input=${t=>this._changed("background",t.target.value)} />
        </div>
        <div class="row">
          <label>Text Color</label>
          <input type="text" .value=${this._config.text_color||""}
            placeholder="e.g. #ffffff"
            @input=${t=>this._changed("text_color",t.target.value)} />
        </div>
      </div>
    `:W}_changed(t,e){const i={...this._config,[t]:e};""!==e&&void 0!==e||delete i[t],this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}};function ae(t,e=48){return(ne[t]||ne.cloudy)(e)}ie.styles=o`
    .editor {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    label {
      font-size: 14px;
      font-weight: 500;
    }
    select, input {
      padding: 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
    }
  `,t([vt({attribute:!1})],ie.prototype,"hass",void 0),t([gt()],ie.prototype,"_config",void 0),ie=t([ct("planavista-clock-card-editor")],ie);const ne={sunny:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="12" fill="#FBBF24" />
      <g stroke="#FBBF24" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="6" x2="32" y2="14" class="pv-sun-ray" />
        <line x1="32" y1="50" x2="32" y2="58" class="pv-sun-ray" />
        <line x1="6" y1="32" x2="14" y2="32" class="pv-sun-ray" />
        <line x1="50" y1="32" x2="58" y2="32" class="pv-sun-ray" />
        <line x1="13.6" y1="13.6" x2="19.3" y2="19.3" class="pv-sun-ray" />
        <line x1="44.7" y1="44.7" x2="50.4" y2="50.4" class="pv-sun-ray" />
        <line x1="13.6" y1="50.4" x2="19.3" y2="44.7" class="pv-sun-ray" />
        <line x1="44.7" y1="19.3" x2="50.4" y2="13.6" class="pv-sun-ray" />
      </g>
    </svg>`,"clear-night":t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 14C30 14 23 20 21 28C20 31 20 35 21 38C23 44 28 49 35 50C38 51 41 51 44 50C36 52 27 48 23 40C19 32 21 22 28 16C31 14 34 13 38 14Z" fill="#94A3B8" />
      <circle cx="44" cy="16" r="1.5" fill="#94A3B8" opacity="0.6" />
      <circle cx="50" cy="24" r="1" fill="#94A3B8" opacity="0.4" />
      <circle cx="46" cy="32" r="1.2" fill="#94A3B8" opacity="0.5" />
    </svg>`,cloudy:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2C52 32.2 52 32.2 52 32.3" fill="#CBD5E1" />
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2V40C52 40 50 40 48 40Z" fill="#94A3B8" />
    </svg>`,partlycloudy:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="22" r="10" fill="#FBBF24" />
      <g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round">
        <line x1="26" y1="6" x2="26" y2="10" />
        <line x1="26" y1="34" x2="26" y2="38" />
        <line x1="10" y1="22" x2="14" y2="22" />
        <line x1="38" y1="22" x2="42" y2="22" />
        <line x1="14.7" y1="10.7" x2="17.5" y2="13.5" />
        <line x1="34.5" y1="30.5" x2="37.3" y2="33.3" />
        <line x1="14.7" y1="33.3" x2="17.5" y2="30.5" />
        <line x1="34.5" y1="13.5" x2="37.3" y2="10.7" />
      </g>
      <path d="M50 46H22C17.6 46 14 42.4 14 38C14 33.6 17.6 30 22 30C22.3 30 22.5 30 22.8 30C24.3 25.4 28.8 22 34 22C40.3 22 45.5 26.5 46.2 32.5C46.8 32.3 47.4 32.2 48 32.2C51 32.2 53.5 34.7 53.5 37.7V46H50Z" fill="#CBD5E1" />
    </svg>`,rainy:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 34H18C13.6 34 10 30.4 10 26C10 21.6 13.6 18 18 18C18.2 18 18.5 18 18.7 18C20.2 12.6 25.2 9 31 9C37.9 9 43.5 13.9 44.2 20.5C44.8 20.3 45.4 20.2 46 20.2C49.3 20.2 52 22.9 52 26.2V34H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="40" x2="20" y2="48" class="pv-rain-drop" />
        <line x1="32" y1="40" x2="30" y2="48" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="42" y1="40" x2="40" y2="48" class="pv-rain-drop" style="animation-delay: 0.6s" />
        <line x1="27" y1="48" x2="25" y2="56" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="37" y1="48" x2="35" y2="56" class="pv-rain-drop" style="animation-delay: 0.45s" />
      </g>
    </svg>`,pouring:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <g stroke="#3B82F6" stroke-width="3" stroke-linecap="round">
        <line x1="18" y1="36" x2="15" y2="48" class="pv-rain-drop" />
        <line x1="26" y1="36" x2="23" y2="48" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="34" y1="36" x2="31" y2="48" class="pv-rain-drop" style="animation-delay: 0.4s" />
        <line x1="42" y1="36" x2="39" y2="48" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="50" y1="36" x2="47" y2="48" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="19" y2="58" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="30" y1="48" x2="27" y2="58" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="38" y1="48" x2="35" y2="58" class="pv-rain-drop" style="animation-delay: 0.45s" />
        <line x1="46" y1="48" x2="43" y2="58" class="pv-rain-drop" style="animation-delay: 0.6s" />
      </g>
    </svg>`,snowy:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <circle cx="20" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" />
      <circle cx="32" cy="40" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.3s" />
      <circle cx="44" cy="43" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
      <circle cx="25" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="38" cy="51" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
    </svg>`,"snowy-rainy":t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="38" x2="20" y2="46" class="pv-rain-drop" />
        <line x1="42" y1="38" x2="40" y2="46" class="pv-rain-drop" style="animation-delay: 0.3s" />
      </g>
      <circle cx="32" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="27" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
      <circle cx="37" cy="50" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
    </svg>`,fog:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="12" y1="24" x2="52" y2="24" opacity="0.4" />
        <line x1="16" y1="32" x2="48" y2="32" opacity="0.6" />
        <line x1="12" y1="40" x2="52" y2="40" opacity="0.8" />
        <line x1="18" y1="48" x2="46" y2="48" opacity="0.5" />
      </g>
    </svg>`,hail:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#94A3B8" />
      <circle cx="20" cy="40" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="32" cy="44" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="44" cy="38" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="26" cy="52" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="38" cy="54" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
    </svg>`,lightning:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <path d="M34 30L28 42H34L30 56L42 40H36L40 30H34Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5" />
    </svg>`,"lightning-rainy":t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.2 12 18.5 12 18.7 12C20.2 6.6 25.2 3 31 3C37.9 3 43.5 7.9 44.2 14.5C44.8 14.3 45.4 14.2 46 14.2C49.3 14.2 52 16.9 52 20.2V28H48Z" fill="#64748B" />
      <path d="M34 28L28 40H34L30 52L42 38H36L40 28H34Z" fill="#FBBF24" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="44" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="48" y1="34" x2="46" y2="42" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="20" y2="56" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="44" y1="46" x2="42" y2="54" class="pv-rain-drop" style="animation-delay: 0.4s" />
      </g>
    </svg>`,windy:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M10 24 Q30 24 38 20 Q46 16 48 20 Q50 24 46 24" fill="none" />
        <path d="M8 34 Q28 34 40 30 Q48 28 50 32 Q52 36 48 36" fill="none" />
        <path d="M14 44 Q30 44 36 40 Q42 36 44 40 Q46 44 42 44" fill="none" />
      </g>
    </svg>`,"windy-variant":t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H22C17.6 28 14 24.4 14 20C14 15.6 17.6 12 22 12C22.2 12 22.5 12 22.7 12C24.2 7 28.8 4 34 4C40.3 4 45.5 8.5 46.2 14.5C46.8 14.3 47.4 14.2 48 14.2C51 14.2 53.5 16.7 53.5 19.7V28H48Z" fill="#CBD5E1" />
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <path d="M8 36 Q28 36 36 33 Q44 30 46 34 Q48 38 44 38" fill="none" />
        <path d="M12 46 Q28 46 34 43 Q40 40 42 44 Q44 48 40 48" fill="none" />
      </g>
    </svg>`,exceptional:t=>R`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#F59E0B" stroke-width="3" fill="none" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    </svg>`},re={sunny:"linear-gradient(135deg, #FBBF24 0%, #F97316 100%)","clear-night":"linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",cloudy:"linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",partlycloudy:"linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)",rainy:"linear-gradient(135deg, #475569 0%, #334155 100%)",pouring:"linear-gradient(135deg, #334155 0%, #1E293B 100%)",snowy:"linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)",fog:"linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)",lightning:"linear-gradient(135deg, #475569 0%, #1E293B 100%)",windy:"linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",default:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};let se=class extends lt{setConfig(t){this._config={entity:"sensor.planavista_config",show_details:!0,show_forecast:!1,layout:"horizontal",...t}}updated(t){if(super.updated(t),t.has("hass")||t.has("_config")){const t=this._getDisplayConfig();Et(this,St(this._config?.theme,t?.theme))}}_getDisplayConfig(){if(this.hass)return yt(this.hass,this._config?.entity)?.display}_getWeatherEntity(){const t=this._config?.weather_entity||this._getDisplayConfig()?.weather_entity;return t?this.hass?.states?.[t]:null}render(){if(!this._config||!this.hass)return W;const t=this._getWeatherEntity();if(!t)return R`
        <ha-card>
          <div class="no-weather">
            <ha-icon icon="mdi:weather-cloudy-alert"></ha-icon>
            <p>No weather entity configured</p>
          </div>
        </ha-card>
      `;const e=t.state||"cloudy",i=Math.round(t.attributes.temperature??0),a=t.attributes.humidity,n=t.attributes.wind_speed,r=t.attributes.temperature_unit||"°F",s=t.attributes.wind_speed_unit||"mph",o=!1!==this._config.show_details,l=!0===this._config.show_forecast,d=t.attributes.forecast||[],c=this._config.layout||"horizontal",p=this._config.background||re[e]||re.default,h=this._config.text_color||"white";return R`
      <ha-card style="${`background: ${p}; color: ${h};`}">
        <div class="weather-main ${"vertical"===c?"vertical":""}">
          <div class="weather-icon">
            ${ae(e,56)}
          </div>
          <div class="weather-info">
            <div class="weather-temp">
              ${i}<span class="unit">${r}</span>
            </div>
            <div class="weather-condition">
              ${e.replace(/-/g," ")}
            </div>
          </div>
        </div>

        ${o?R`
          <div class="weather-details">
            ${null!=a?R`
              <div class="weather-detail">
                <ha-icon icon="mdi:water-percent"></ha-icon>
                <span>${a}%</span>
              </div>
            `:W}
            ${null!=n?R`
              <div class="weather-detail">
                <ha-icon icon="mdi:weather-windy"></ha-icon>
                <span>${n} ${s}</span>
              </div>
            `:W}
          </div>
        `:W}

        ${l&&d.length>0?R`
          <div class="forecast">
            ${d.slice(0,5).map(t=>{const e=new Date(t.datetime).toLocaleDateString("en-US",{weekday:"short"});return R`
                <div class="forecast-day">
                  <div class="forecast-day-name">${e}</div>
                  <div class="forecast-icon">
                    ${ae(t.condition,28)}
                  </div>
                  <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(t.temperature)}\u00B0</span>
                    ${null!=t.templow?R`<span class="forecast-low"> / ${Math.round(t.templow)}\u00B0</span>`:W}
                  </div>
                </div>
              `})}
          </div>
        `:W}
      </ha-card>
    `}getCardSize(){return this._config?.show_forecast?4:2}static getStubConfig(){return{entity:"sensor.planavista_config",show_details:!0,show_forecast:!1}}};se.styles=[zt,Tt,o`
      ${s("\n  @keyframes pv-rain-fall {\n    0% { transform: translateY(0); opacity: 1; }\n    100% { transform: translateY(8px); opacity: 0; }\n  }\n\n  @keyframes pv-snow-fall {\n    0% { transform: translateY(0) rotate(0deg); opacity: 1; }\n    100% { transform: translateY(10px) rotate(180deg); opacity: 0; }\n  }\n\n  @keyframes pv-sun-spin {\n    from { transform-origin: center; transform: rotate(0deg); }\n    to { transform-origin: center; transform: rotate(360deg); }\n  }\n\n  .pv-rain-drop {\n    animation: pv-rain-fall 1s ease-in infinite;\n  }\n\n  .pv-snow-flake {\n    animation: pv-snow-fall 2s ease-in-out infinite;\n  }\n\n  .pv-sun-ray {\n    animation: pv-sun-spin 20s linear infinite;\n    transform-origin: 32px 32px;\n  }\n")}

      :host { display: block; }

      ha-card {
        padding: 1.5rem;
        color: white;
        transition: all var(--pv-transition, 200ms ease);
      }

      .weather-main {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .weather-main.vertical {
        flex-direction: column;
        text-align: center;
      }

      .weather-icon {
        flex-shrink: 0;
        line-height: 1;
      }

      .weather-info {
        flex: 1;
        min-width: 0;
      }

      .weather-temp {
        font-size: 2.75rem;
        font-weight: 300;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .weather-temp .unit {
        font-size: 0.4em;
        font-weight: 400;
        opacity: 0.7;
        vertical-align: super;
      }

      .weather-condition {
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.85;
        text-transform: capitalize;
        margin-top: 0.25rem;
      }

      .weather-details {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.875rem;
        opacity: 0.85;
      }

      .weather-detail {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .weather-detail ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.8;
      }

      .forecast {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .forecast::-webkit-scrollbar { display: none; }

      .forecast-day {
        text-align: center;
        min-width: 56px;
        flex-shrink: 0;
      }

      .forecast-day-name {
        font-size: 0.75rem;
        opacity: 0.7;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .forecast-icon {
        margin: 0.375rem 0;
        display: flex;
        justify-content: center;
      }

      .forecast-temps {
        font-size: 0.8125rem;
      }

      .forecast-high {
        font-weight: 600;
      }

      .forecast-low {
        opacity: 0.6;
        font-weight: 400;
      }

      .no-weather {
        text-align: center;
        padding: 1rem;
        color: var(--pv-text-secondary);
      }

      .no-weather ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
      }

      .no-weather p {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }
    `],t([vt({attribute:!1})],se.prototype,"hass",void 0),t([gt()],se.prototype,"_config",void 0),se=t([ct("planavista-weather-card")],se);let oe=class extends lt{constructor(){super(...arguments),this._pv=new Ft(this)}setConfig(t){this._config={entity:"sensor.planavista_config",layout:"horizontal",show_names:!0,show_add_button:!0,...t}}updated(t){if(super.updated(t),t.has("hass")||t.has("_config")){const t=yt(this.hass,this._config?.entity);Et(this,St(this._config?.theme,t?.display?.theme))}}_getCalendars(){if(!this.hass)return[];const t=yt(this.hass,this._config?.entity);return t?.calendars||[]}_isHidden(t){return this._pv.state.hiddenCalendars.has(t)}_toggleCalendar(t){this._pv.state.toggleCalendar(t)}_openCreateDialog(){this._pv.state.openCreateDialog()}_setView(t){this._pv.state.setView(t)}render(){if(!this._config||!this.hass)return W;const t=this._getCalendars(),e=this._config.layout||"horizontal",i=!1!==this._config.show_names,a=!1!==this._config.show_add_button,n=this._pv.state.currentView;return R`
      <ha-card>
        <div class="toggles-container ${"vertical"===e?"vertical":""}">
          ${t.map(t=>this._renderToggle(t,i))}
          ${a&&t.length>0?R`<div class="divider"></div>`:W}
          ${a?R`
            <button class="new-event-btn" @click=${this._openCreateDialog}>
              <ha-icon icon="mdi:plus"></ha-icon>
              New Event
            </button>
          `:W}
        </div>

        <div class="view-switcher">
          ${["day","week","month"].map(t=>R`
            <button
              class="view-btn ${n===t?"active":""}"
              @click=${()=>this._setView(t)}
            >${t}</button>
          `)}
        </div>
      </ha-card>
    `}_renderToggle(t,e){const i=this._isHidden(t.entity_id),a=t.person_entity?xt(this.hass,t.person_entity):null,n=e?t.person_entity?bt(this.hass,t.person_entity):t.display_name:"",r=n?n[0].toUpperCase():"?";return R`
      <button
        class="toggle-btn ${i?"inactive":"active"}"
        style="${i?"":`background: ${t.color}; --cal-color: ${t.color};`}"
        @click=${()=>this._toggleCalendar(t.entity_id)}
      >
        ${a?R`<img class="avatar" src="${a}" alt="${n}" />`:e?R`<span class="avatar-placeholder">${r}</span>`:R`<span class="color-dot" style="background: ${t.color}"></span>`}
        ${e?R`<span>${n}</span>`:W}
      </button>
    `}getCardSize(){return 2}static getStubConfig(){return{entity:"sensor.planavista_config",show_names:!0,show_add_button:!0}}};oe.styles=[zt,Mt,o`
      :host { display: block; }

      ha-card {
        padding: 1rem 1.25rem;
      }

      .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .toggles-container.vertical {
        flex-direction: column;
      }

      .toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        border: 2px solid transparent;
        border-radius: 9999px;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        min-height: 48px;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        background: transparent;
      }

      .toggle-btn.active {
        color: white;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--cal-color) 30%, transparent);
      }

      .toggle-btn.inactive {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.03));
        color: var(--pv-text-muted, #9CA3AF);
        border-color: var(--pv-border-subtle);
      }

      .toggle-btn:hover {
        transform: translateY(-1px);
      }

      .toggle-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .avatar-placeholder {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        flex-shrink: 0;
      }

      .toggle-btn.active .avatar-placeholder {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }

      .toggle-btn.inactive .avatar-placeholder {
        background: var(--pv-border);
        color: var(--pv-text-muted);
      }

      .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .divider {
        width: 1px;
        height: 32px;
        background: var(--pv-border);
        margin: 0 0.25rem;
        flex-shrink: 0;
      }

      .new-event-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 9999px;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--pv-accent) 25%, transparent);
      }

      .new-event-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--pv-accent) 35%, transparent);
      }

      .new-event-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .new-event-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .view-switcher {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle);
        border-radius: var(--pv-radius-sm, 8px);
        padding: 3px;
        margin-top: 0.75rem;
      }

      .view-btn {
        flex: 1;
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        text-transform: capitalize;
        min-height: 36px;
      }

      .view-btn.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .view-btn:hover:not(.active) {
        color: var(--pv-text);
      }
    `],t([vt({attribute:!1})],oe.prototype,"hass",void 0),t([gt()],oe.prototype,"_config",void 0),oe=t([ct("planavista-toggles-card")],oe),window.customCards=window.customCards||[],window.customCards.push({type:"planavista-grid-card",name:"PlanaVista",description:"Calendar grid with day, week, and month views",preview:!0},{type:"planavista-agenda-card",name:"PlanaVista Agenda",description:"Upcoming events list",preview:!0},{type:"planavista-clock-card",name:"PlanaVista Clock",description:"Time and date display",preview:!0},{type:"planavista-weather-card",name:"PlanaVista Weather",description:"Weather conditions and forecast",preview:!0},{type:"planavista-toggles-card",name:"PlanaVista Toggles",description:"Calendar visibility toggles",preview:!0}),console.info("%c PLANAVISTA %c v1.0.0 ","color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
