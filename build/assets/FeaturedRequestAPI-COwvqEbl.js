import{c as s,V as t}from"./index-DOzAOoeX.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16.5 12",key:"1aq6pp"}]],i=s("clock-3",r),u={async submitRequest(e,a){return(await t.post(`/api/events/${e}/featured-request`,{message:a})).data.data},async getMyRequests(){return(await t.get("/api/events/my-featured-requests")).data.data},async getAllRequests(){return(await t.get("/api/admin/featured-requests")).data.data},async approve(e,a){await t.patch(`/api/admin/featured-requests/${e}/approve`,{adminNote:a})},async reject(e,a){await t.patch(`/api/admin/featured-requests/${e}/reject`,{adminNote:a})}};export{i as C,u as F};
