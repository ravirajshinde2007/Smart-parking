/* ParkSmart backend integration
   Loaded AFTER script.js. It keeps the existing UI/flow but moves
   authentication, parking, slots, bookings, payments and access logs
   to the Node/Express API.
*/
(() => {
  const API = `${location.origin}/api`;
  const state = {
    token: sessionStorage.getItem('parksmart_token') || localStorage.getItem('parksmart_token') || '',
    user: JSON.parse(sessionStorage.getItem('parksmart_user') || localStorage.getItem('parksmart_user') || 'null'),
    parking: [],
    slots: new Map(),
    selectedParking: null,
    selectedSlot: null,
    map: null,
    markers: [],
    currentMarker: null
  };

  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const toast = msg => window.showToast ? window.showToast(msg) : alert(msg);

  async function api(path, options={}) {
    const headers = new Headers(options.headers || {});
    if (state.token) headers.set('Authorization', `Bearer ${state.token}`);
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
    let res;
    try {
      res = await fetch(API + path, {...options, headers});
    } catch (e) {
      throw new Error('Cannot connect to the ParkSmart server. Start the backend with npm run dev and open http://localhost:5000.');
    }
    let data = {};
    try { data = await res.json(); } catch {}
    if (res.status === 401) {
      state.token=''; sessionStorage.removeItem('parksmart_token'); localStorage.removeItem('parksmart_token');
    }
    if (!res.ok) {
      if (res.status >= 500) {
        throw new Error(data.error ? `Server/database error: ${data.error}` : (data.message || 'Server error. Check MySQL and the backend terminal.'));
      }
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  }

  function saveSession(data, remember=false) {
    state.token=data.token; state.user=data.user;
    const store=remember ? localStorage : sessionStorage;
    store.setItem('parksmart_token',data.token);
    store.setItem('parksmart_user',JSON.stringify(data.user));
  }
  function clearSession() {
    state.token=''; state.user=null;
    sessionStorage.removeItem('parksmart_token'); sessionStorage.removeItem('parksmart_user');
    localStorage.removeItem('parksmart_token'); localStorage.removeItem('parksmart_user');
  }

  function syncProfile() {
    if (!state.user) return;
    document.querySelectorAll('.profile-name strong').forEach(x => x.textContent=state.user.firstName || 'Driver');
    document.querySelectorAll('.profile-user strong').forEach(x => x.textContent=`${state.user.firstName||''} ${state.user.lastName||''}`.trim());
    document.querySelectorAll('.profile-user small').forEach(x => x.textContent=state.user.email || '');
    const av=(state.user.firstName||'D').charAt(0).toUpperCase();
    document.querySelectorAll('.profile-avatar,.large-profile-avatar').forEach(x=>x.textContent=av);
  }

  // ---------- Authentication ----------
  // These handlers are attached directly to the forms. The old demo
  // localStorage handlers have been removed from script.js.
  async function handleLogin(e){
    e.preventDefault();
    const email=$('loginEmail')?.value.trim().toLowerCase();
    const password=$('loginPassword')?.value || '';
    if(!email) return toast('Please enter your email.');
    if(!password) return toast('Please enter your password.');
    if(password.length<6) return toast('Password must contain at least 6 characters.');
    try{
      const data=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
      saveSession(data, !!$('rememberMe')?.checked);
      syncProfile();
      toast('Login successful! Welcome to ParkSmart.');
      await bootstrapDashboard();
    }catch(err){ toast(err.message); }
  }

  async function handleRegister(e){
    e.preventDefault();
    const firstName=$('firstName')?.value.trim();
    const lastName=$('lastName')?.value.trim();
    const email=$('registerEmail')?.value.trim().toLowerCase();
    const phone=$('phone')?.value.trim();
    const password=$('registerPassword')?.value || '';
    const confirm=$('confirmPassword')?.value || '';
    if(!firstName) return toast('Enter your first name.');
    if(!lastName) return toast('Enter your last name.');
    if(!email) return toast('Enter your email address.');
    if(!phone) return toast('Enter your mobile number.');
    if(password.length<6) return toast('Password must contain at least 6 characters.');
    if(password!==confirm) return toast('Passwords do not match.');
    if(!$('terms')?.checked) return toast('Please accept the Terms & Conditions.');
    try{
      await api('/auth/register',{method:'POST',body:JSON.stringify({firstName,lastName,email,phone,password})});
      e.target.reset();
      if($('loginEmail')) $('loginEmail').value=email;
      window.showLogin?.();
      toast('Account created successfully. Please login.');
    }catch(err){ toast(err.message); }
  }

  function bindAuthentication(){
    $('loginForm')?.addEventListener('submit',handleLogin);
    $('registerForm')?.addEventListener('submit',handleRegister);
    document.addEventListener('click', e => {
      const btn=e.target.closest?.('#logoutButton,#sidebarLogout');
      if(!btn) return;
      e.preventDefault();
      if(!confirm('Do you want to logout?')) return;
      clearSession();
      $('dashboardView')?.classList.add('hidden');
      if($('dashboardView')) $('dashboardView').style.display='none';
      if($('authPage')) $('authPage').style.display='flex';
      window.showLogin?.();
      toast('You have been logged out.');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindAuthentication,{once:true});
  else bindAuthentication();

  // ---------- Map / parking ----------
  function initMap() {
    const el=$('parkingMap');
    if(!el || !window.L) return null;
    if(state.map) {
      try { state.map.invalidateSize(); } catch {}
      return state.map;
    }

    // Recover safely if an older cached ParkSmart script initialized Leaflet first.
    if(el._leaflet_id) {
      el.innerHTML='';
      try { delete el._leaflet_id; } catch {}
    }
    el.style.height='470px';
    el.style.width='100%';
    state.map=L.map(el,{preferCanvas:true}).setView([22.9734,78.6569],5);
    // Use Esri World Street Map tiles: no API key and avoids the blocked OSM/CARTO tile servers.
    const tileLayer=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{
      attribution:'&copy; Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community',
      maxZoom:19,
      crossOrigin:true
    }).addTo(state.map);
    tileLayer.on('tileerror',()=>{
      toast('Map tiles could not be loaded. Check your internet connection.');
    });
    setTimeout(()=>{ try { state.map.invalidateSize(true); } catch {} },100);
    return state.map;
  }

  function statusOf(p) {
    const pct=Number(p.capacity)?Number(p.available)/Number(p.capacity)*100:0;
    return Number(p.available)===0?'full':pct<=20?'limited':'available';
  }

  function renderMap(list) {
    initMap(); if(!state.map) return;
    state.markers.forEach(m=>state.map.removeLayer(m)); state.markers=[];
    list.forEach(p=>{
      const status=statusOf(p);
      const color=status==='available'?'#22c55e':status==='limited'?'#f59e0b':'#ef4444';
      const icon=L.divIcon({className:'',html:`<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,.5)"></div>`,iconSize:[18,18],iconAnchor:[9,9]});
      const m=L.marker([p.lat,p.lng],{icon}).addTo(state.map);
      m.bindPopup(`<strong>${esc(p.name)}</strong><br>📍 ${esc(p.area)}, ${esc(p.city)}<br>🅿️ ${p.available} spaces available<br><br><button type="button" class="view-slots-btn" data-parking-id="${esc(p.id)}">View Slots</button>`);
      state.markers.push(m);
    });
    if(list.length===1){
      state.map.setView([Number(list[0].lat),Number(list[0].lng)],15);
    }else if(list.length>1){
      const bounds=L.latLngBounds(list.map(p=>[Number(p.lat),Number(p.lng)]));
      state.map.fitBounds(bounds,{padding:[40,40],maxZoom:15});
    }
  }

  function renderParking(list) {
    state.parking=list || [];
    const listEl=$('parkingList');
    if(!listEl) return;
    $('parkingCount') && ($('parkingCount').textContent=`${state.parking.length} locations`);
    if(!state.parking.length) {
      listEl.innerHTML='<div class="no-parking"><h3>No parking found</h3><p>Try another city, area, place or colony.</p></div>';
      renderMap([]); return;
    }
    listEl.innerHTML=state.parking.map(p=>{
      const status=statusOf(p);
      const text=status==='available'?'Available':status==='limited'?'Limited':'Full';
      return `<div class="parking-result">
        <div class="parking-result-top"><div><strong>${esc(p.name)}</strong><small>📍 ${esc(p.area)}, ${esc(p.city)}</small></div>
        <span class="parking-status ${status}">${text}</span></div>
        <div class="parking-result-bottom"><span class="spaces">🅿️ ${p.available}/${p.capacity} spaces available</span></div>
        <button class="parking-book-btn" type="button" data-parking-id="${esc(p.id)}">View Slots</button>
      </div>`;
    }).join('');
    renderMap(state.parking);
  }

  async function searchParking(q) {
    try {
      const rows=await api(`/parking/search?q=${encodeURIComponent(q)}`);
      renderParking(rows);
      $('selectedLocationText') && ($('selectedLocationText').textContent=`Showing results for "${q}"`);
      $('parkingHeading') && ($('parkingHeading').textContent='Parking near your search');
      if($('searchResults')) $('searchResults').innerHTML=`<div class="search-result-message">${rows.length} parking location(s) found.</div>`;
    } catch(err){ toast(err.message); }
  }

  async function nearby(lat,lng) {
    try {
      const rows=await api(`/parking/nearby?lat=${lat}&lng=${lng}&radiusKm=15`);
      renderParking(rows);
      $('selectedLocationText') && ($('selectedLocationText').textContent='📍 Your current location');
      $('parkingHeading') && ($('parkingHeading').textContent='Parking near your location');
      $('searchResults') && ($('searchResults').innerHTML=`<div class="search-result-message">${rows.length} parking location(s) found near you.</div>`);
      if(state.map) state.map.setView([lat,lng],15);
      if(state.currentMarker) state.map.removeLayer(state.currentMarker);
      state.currentMarker=L.marker([lat,lng]).addTo(state.map).bindPopup('<strong>📍 You are here</strong>').openPopup();
    } catch(err){ toast(err.message); }
  }

  document.addEventListener('click',e=>{
    const slotBtn=e.target.closest?.('.view-slots-btn, .parking-book-btn');
    if(slotBtn){
      e.preventDefault(); e.stopImmediatePropagation();
      const id=slotBtn.getAttribute('data-parking-id');
      if(id) window.openParkingSlots(id);
      return;
    }
    const search=e.target.closest?.('#searchLocationBtn');
    const current=e.target.closest?.('#currentLocationBtn');
    const clear=e.target.closest?.('#clearSearch');
    if(search){
      e.preventDefault(); e.stopImmediatePropagation();
      const q=$('parkingSearch')?.value.trim(); if(!q) return toast('Enter an area, city or place to search.');
      searchParking(q);
    } else if(current){
      e.preventDefault(); e.stopImmediatePropagation();
      if(!navigator.geolocation) return toast('Geolocation is not supported by this browser.');
      current.disabled=true; current.textContent='📍 Getting Location...';
      navigator.geolocation.getCurrentPosition(
        pos=>{ current.disabled=false; current.textContent='📍 Use My Current Location'; nearby(pos.coords.latitude,pos.coords.longitude); },
        ()=>{ current.disabled=false; current.textContent='📍 Use My Current Location'; toast('Location permission was denied or unavailable.'); },
        {enableHighAccuracy:true,timeout:20000,maximumAge:60000}
      );
    } else if(clear){
      e.preventDefault(); e.stopImmediatePropagation();
      if($('parkingSearch')) $('parkingSearch').value='';
      if($('searchResults')) $('searchResults').innerHTML='';
      $('parkingList').innerHTML='<div class="no-parking parking-location-prompt"><h3>📍 Select a location to find parking</h3><p>Use <strong>Current Location</strong> or search for an area, city or locality.</p></div>';
      $('parkingCount') && ($('parkingCount').textContent='0 locations');
      renderMap([]);
    }
  },true);

  document.addEventListener('keydown',e=>{
    if(e.target?.id==='parkingSearch' && e.key==='Enter'){
      e.preventDefault(); e.stopImmediatePropagation();
      const q=e.target.value.trim(); if(q) searchParking(q);
    }
  },true);

  // ---------- Server-side slots ----------
  async function loadSlots(parkingId) {
    const rows=await api(`/parking/${parkingId}/slots`);
    state.slots.set(String(parkingId),rows);
    return rows;
  }

  function renderSlots(rows) {
    const grid=$('parkingSlotGrid'); if(!grid) return;
    const vacant=rows.filter(s=>s.status==='vacant').length;
    $('slotAvailabilityText') && ($('slotAvailabilityText').textContent=`${vacant} vacant out of ${rows.length} slots`);
    grid.innerHTML='';
    rows.forEach(slot=>{
      const b=document.createElement('button');
      b.type='button'; b.textContent=slot.id;
      b.className=`parking-slot ${slot.status}`;
      if(state.selectedSlot?.id===slot.id) b.className='parking-slot selected';
      b.disabled=slot.status!=='vacant';
      b.title=slot.status==='vacant'?'Click to select this slot':slot.status;
      b.onclick=()=>{state.selectedSlot=slot; renderSlots(rows); $('selectedSlotName') && ($('selectedSlotName').textContent=slot.id); $('bookSelectedSlot') && ($('bookSelectedSlot').disabled=false);};
      grid.appendChild(b);
    });
    $('selectedSlotName') && ($('selectedSlotName').textContent=state.selectedSlot?.id || 'None');
    $('bookSelectedSlot') && ($('bookSelectedSlot').disabled=!state.selectedSlot);
  }

  window.openParkingSlots=async function(parkingId){
    const p=state.parking.find(x=>String(x.id)===String(parkingId));
    if(!p) return toast('Parking location not found.');
    state.selectedParking=p; state.selectedSlot=null;
    $('dashboardSection') && ($('dashboardSection').hidden=true);
    $('parkingSlotsPage') && ($('parkingSlotsPage').hidden=false);
    $('slotParkingName') && ($('slotParkingName').textContent=p.name);
    $('slotParkingLocation') && ($('slotParkingLocation').textContent=`📍 ${p.area}, ${p.city}`);
    try { renderSlots(await loadSlots(p.id)); } catch(err){ toast(err.message); }
    window.scrollTo({top:0,behavior:'smooth'});
  };

  window.bookSelectedParkingSlot=async function(){
    if(!state.selectedParking || !state.selectedSlot) return toast('Please select a vacant parking slot first.');
    const p=state.selectedParking, s=state.selectedSlot;
    const fresh=await loadSlots(p.id);
    const current=fresh.find(x=>x.id===s.id);
    if(!current || current.status!=='vacant') return toast('This slot is no longer available.');
    // Keep the existing booking-details -> payment UI unchanged.
    window.openBookingDetailsModal(p,s.id,Number(p.rate)||0);
  };

  // ---------- Backend booking cache ----------
  window.getBookings=()=>state.bookings || [];
  state.bookings=[];
  async function refreshBookings(){
    state.bookings=await api('/bookings');
    // Map server shape to the existing UI's names.
    state.bookings=state.bookings.map(b=>({
      ...b,id:b.bookingCode,serverId:b.id,
      parkingId:b.parkingId,parkingName:b.parkingName,parkingArea:b.parkingArea,parkingCity:b.parkingCity,
      slotId:b.slotId,status:b.status.charAt(0)+b.status.slice(1).toLowerCase(),
      createdAt:new Date(b.createdAt).toLocaleString(),vehicleType:b.vehicleType,carType:b.carType,carNumber:b.carNumber,
      hours:b.hours,startTime:b.startTime,
      payment:b.paymentMethod?{amount:Number(b.amount),method:b.paymentMethod,txnId:b.txnId,paidAt:b.paidAt,status:b.paymentStatus}:null
    }));
    return state.bookings;
  }

  window.displayMyBookings=async function(){
    const list=$('myBookingsList'), count=$('bookingCount'); if(!list) return;
    const bookings=state.bookings || [];
    if(count) count.textContent=`${bookings.length} ${bookings.length===1?'booking':'bookings'}`;
    if(!bookings.length){list.innerHTML='<div class="no-bookings"><div class="no-bookings-icon">🅿️</div><p>You don\'t have any reserved parking slots.</p><small>Select a parking location and book a vacant slot.</small></div>';return;}
    list.innerHTML=bookings.map(b=>`<div class="booking-card">
      <div class="booking-card-header"><div><strong>${esc(b.parkingName)}</strong><small>📍 ${esc(b.parkingArea)}, ${esc(b.parkingCity)}</small></div>
      <span class="booking-status">${b.status==='Completed'?'🟢 Completed':b.status==='Parked'?'🔵 Parked':b.status==='Cancelled'?'⚪ Cancelled':'🟡 Reserved'}</span></div>
      <div class="booking-card-details">
       <div><span>Parking Slot</span><strong>${esc(b.slotId)}</strong></div>
       <div><span>Booking ID</span><strong>${esc(b.id)}</strong></div>
       <div><span>Vehicle</span><strong>${esc(b.carNumber)}</strong></div>
       <div><span>Booked On</span><strong>${esc(b.createdAt)}</strong></div>
      </div>
      ${b.status==='Reserved'?`<button type="button" class="cancel-booking-btn" onclick="cancelParkingBooking('${esc(b.id)}')">Cancel Reservation</button>`:''}
    </div>`).join('');
  };

  window.cancelParkingBooking=async function(code){
    const b=(state.bookings||[]).find(x=>x.id===code);
    if(!b) return toast('Booking not found.');
    if(!confirm(`Cancel reservation for slot ${b.slotId}?`)) return;
    try{ await api(`/bookings/${b.serverId}/cancel`,{method:'POST'}); await refreshBookings(); await displayMyBookings(); toast('Reservation cancelled.'); await refreshCurrentParking(); }
    catch(err){toast(err.message);}
  };

  async function refreshCurrentParking(){
    if(!state.parking.length) return;
    const q=$('parkingSearch')?.value.trim();
    if(q) return searchParking(q);
    // Keep current list but refresh each lot's availability.
    const fresh=await api('/parking/search?q='+encodeURIComponent(state.parking[0].city));
    const ids=new Set(state.parking.map(x=>String(x.id)));
    renderParking(fresh.filter(x=>ids.has(String(x.id))));
  }

  window.completeBookingAfterPayment=async function(details,payment,amountOverride){
    try{
      const result=await api('/bookings',{method:'POST',body:JSON.stringify({
        parkingId:details.parkingId,slotId:details.slotId,vehicleType:details.vehicleType,
        carType:details.carType,carNumber:details.carNumber,hours:details.hours,
        payment:{method:payment.method,txnId:payment.txnId}
      })});
      toast('Booking confirmed successfully.');
      $('bookingId') && ($('bookingId').textContent=result.bookingCode);
      await refreshBookings(); await displayMyBookings(); await refreshCurrentParking();
      if($('parkingSlotsPage')) $('parkingSlotsPage').hidden=true;
      if($('dashboardSection')) $('dashboardSection').hidden=false;
      state.selectedParking=null; state.selectedSlot=null;
      renderPayments();
      renderLogs();
    }catch(err){toast(err.message);}
  };

  // ---------- Payments ----------
  async function renderPayments(){
    const body=$('paymentsBody'); if(!body) return;
    try{
      const rows=await api('/payments');
      body.innerHTML=rows.map(p=>`<tr>
        <td>${esc(p.bookingCode)}</td><td>${esc(p.parkingName)}</td><td>${esc(p.duration)} hr</td>
        <td>₹${Number(p.amount).toFixed(2)}</td><td>${esc(p.method)}</td><td>${esc(p.status)}</td>
        <td><button type="button" class="pay-ghost" onclick="showReceipt('${esc(p.bookingCode)}')">Receipt</button></td>
      </tr>`).join('');
      const total=rows.filter(x=>x.status==='PAID').reduce((a,x)=>a+Number(x.amount),0);
      $('totalPaid') && ($('totalPaid').textContent=`Total paid: ₹${total.toFixed(2)}`);
      state.payments=rows;
    }catch(err){toast(err.message);}
  }
  window.renderPayments=renderPayments;
  window.showReceipt=function(code){
    const p=(state.payments||[]).find(x=>x.bookingCode===code);
    if(!p) return toast('Receipt not found.');
    $('receiptAmountLarge') && ($('receiptAmountLarge').textContent=`₹${Number(p.amount).toFixed(2)}`);
    $('receiptTxn') && ($('receiptTxn').textContent=p.txnId||'—');
    $('receiptDateTime') && ($('receiptDateTime').textContent=p.paidAt?new Date(p.paidAt).toLocaleString():'—');
    $('receiptPaymentMethod') && ($('receiptPaymentMethod').textContent=p.method||'—');
    $('receiptVehicleType') && ($('receiptVehicleType').textContent=p.vehicleType||'—');
    $('receiptCarType') && ($('receiptCarType').textContent=p.carType||'—');
    $('receiptCarNumber') && ($('receiptCarNumber').textContent=p.carNumber||'—');
    $('receiptSlot') && ($('receiptSlot').textContent=p.slotId||'—');
    $('receiptDuration') && ($('receiptDuration').textContent=`${p.duration||1} hour(s)`);
    const m=$('parkSmartReceiptModal'); if(m){m.hidden=false;m.style.display='grid';m.classList.add('show');}
  };

  // ---------- Entry & Exit (user app is read-only) ----------
  // Entry and exit are recorded by the parking operator/admin.
  // Users only see the recorded timestamps here; no camera or photo access is requested.
  async function renderLogs(){
    const list=$('logsList'); if(!list) return;
    const bookings=state.bookings||[];
    if(!bookings.length){list.innerHTML='<div class="no-bookings"><p>No reservations yet.</p></div>';return;}
    const chunks=await Promise.all(bookings.filter(b=>b.status!=='Cancelled').map(async b=>{
      let logs=[];
      try{logs=await api(`/access/${b.serverId}/logs`);}catch{}
      const entry=logs.find(x=>x.eventType==='ENTRY'), exit=logs.find(x=>x.eventType==='EXIT');
      const box=(title,x)=>`<div class="log-box log-time-only"><div class="log-time-icon">${title==='Entry'?'🚗':'🏁'}</div><strong>${title} Time</strong><span>${x?new Date(x.time).toLocaleString():'Not recorded yet'}</span></div>`;
      return `<div class="booking-card"><div class="booking-card-header"><div><strong>${esc(b.parkingName)}</strong><small>Slot ${esc(b.slotId)} · ${esc(b.id)}</small></div><span class="booking-status">${esc(b.status)}</span></div><div class="log-grid">${box('Entry',entry)}${box('Exit',exit)}</div></div>`;
    }));
    list.innerHTML=chunks.join('');
  }
  window.renderLogs=renderLogs;

  window.initializeParkingDashboard=initMap;

  // =========================================================
  // PROFILE, NOTIFICATIONS & SETTINGS MODULE
  // =========================================================
  const SETTINGS_KEY = 'parksmart_settings';
  const NOTIF_KEY = 'parkSmartNotifs';

  function getSavedSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
        browserNotif: false,
        bookingAlerts: true,
        soundEffects: true,
        vehicleNumber: '',
        vehicleType: 'Car'
      };
    } catch {
      return {
        browserNotif: false,
        bookingAlerts: true,
        soundEffects: true,
        vehicleNumber: '',
        vehicleType: 'Car'
      };
    }
  }

  // --- Profile Modal ---
  function openProfileModal() {
    const modal = $('profileModal');
    if (!modal) return;
    const dropdown = $('profileDropdown');
    if (dropdown) dropdown.classList.remove('show');

    const u = state.user || {};
    if ($('profileFirstName')) $('profileFirstName').value = u.firstName || '';
    if ($('profileLastName')) $('profileLastName').value = u.lastName || '';
    if ($('profileEmail')) $('profileEmail').value = u.email || '';
    if ($('profilePhone')) $('profilePhone').value = u.phone || '';
    if ($('profileModalName')) $('profileModalName').textContent = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Driver';
    if ($('profileModalRoleBadge')) $('profileModalRoleBadge').textContent = (u.role || 'DRIVER').toUpperCase();
    if ($('profileModalAvatar')) $('profileModalAvatar').textContent = (u.firstName || 'D').charAt(0).toUpperCase();

    modal.hidden = false;
    modal.classList.add('show');
    modal.style.display = 'flex';
  }

  function closeProfileModal() {
    const modal = $('profileModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.hidden = true;
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    const firstName = $('profileFirstName')?.value.trim();
    const lastName = $('profileLastName')?.value.trim();
    const phone = $('profilePhone')?.value.trim();

    if (!firstName || !lastName || !phone) {
      return toast('First name, last name, and phone number are required.');
    }

    try {
      if (state.token) {
        const res = await api('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ firstName, lastName, phone })
        });
        if (res.user) {
          state.user = { ...state.user, ...res.user };
          const store = localStorage.getItem('parksmart_token') ? localStorage : sessionStorage;
          store.setItem('parksmart_user', JSON.stringify(state.user));
        }
      } else {
        state.user = { ...state.user, firstName, lastName, phone };
        localStorage.setItem('parksmart_user', JSON.stringify(state.user));
      }
      syncProfile();
      closeProfileModal();
      toast('Profile updated successfully!');
      if (window.addNotification) window.addNotification('👤 Profile updated successfully.');
    } catch (err) {
      toast(err.message || 'Failed to update profile.');
    }
  }

  // --- Settings Modal ---
  function openSettingsModal() {
    const modal = $('settingsModal');
    if (!modal) return;
    const dropdown = $('profileDropdown');
    if (dropdown) dropdown.classList.remove('show');

    const s = getSavedSettings();
    if ($('settingBrowserNotif')) $('settingBrowserNotif').checked = !!s.browserNotif;
    if ($('settingBookingAlerts')) $('settingBookingAlerts').checked = s.bookingAlerts !== false;
    if ($('settingSoundEffects')) $('settingSoundEffects').checked = s.soundEffects !== false;
    if ($('settingVehicleNumber')) $('settingVehicleNumber').value = s.vehicleNumber || '';
    if ($('settingVehicleType')) $('settingVehicleType').value = s.vehicleType || 'Car';

    switchSettingsTab('pref');
    modal.hidden = false;
    modal.classList.add('show');
    modal.style.display = 'flex';
  }

  function closeSettingsModal() {
    const modal = $('settingsModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.hidden = true;
    }
  }

  function switchSettingsTab(tab) {
    const isPref = tab === 'pref';
    if ($('settingsPrefSection')) $('settingsPrefSection').style.display = isPref ? 'block' : 'none';
    if ($('settingsSecSection')) $('settingsSecSection').style.display = isPref ? 'none' : 'block';

    if ($('settingsTabPref')) {
      $('settingsTabPref').className = isPref ? 'settings-tab-btn active' : 'settings-tab-btn';
      $('settingsTabPref').style.background = isPref ? 'rgba(0, 217, 166, 0.2)' : 'rgba(255,255,255,0.05)';
      $('settingsTabPref').style.color = isPref ? '#00d9a6' : '#94a3b8';
    }
    if ($('settingsTabSec')) {
      $('settingsTabSec').className = !isPref ? 'settings-tab-btn active' : 'settings-tab-btn';
      $('settingsTabSec').style.background = !isPref ? 'rgba(0, 217, 166, 0.2)' : 'rgba(255,255,255,0.05)';
      $('settingsTabSec').style.color = !isPref ? '#00d9a6' : '#94a3b8';
    }
  }

  function handleSettingsPrefSubmit(e) {
    e.preventDefault();
    const settings = {
      browserNotif: !!$('settingBrowserNotif')?.checked,
      bookingAlerts: !!$('settingBookingAlerts')?.checked,
      soundEffects: !!$('settingSoundEffects')?.checked,
      vehicleNumber: $('settingVehicleNumber')?.value.trim().toUpperCase() || '',
      vehicleType: $('settingVehicleType')?.value || 'Car'
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    if (settings.browserNotif && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    closeSettingsModal();
    toast('Settings & Preferences saved successfully!');
    if (window.addNotification) window.addNotification('⚙️ Application preferences saved.');
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    const currentPassword = $('settingsCurrentPass')?.value || '';
    const newPassword = $('settingsNewPass')?.value || '';
    const confirmPassword = $('settingsConfirmPass')?.value || '';

    if (!currentPassword || !newPassword) {
      return toast('Please enter current and new password.');
    }
    if (newPassword.length < 6) {
      return toast('New password must contain at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast('New passwords do not match.');
    }

    try {
      if (state.token) {
        await api('/auth/password', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newPassword })
        });
      }
      $('settingsPasswordForm')?.reset();
      closeSettingsModal();
      toast('Password changed successfully!');
      if (window.addNotification) window.addNotification('🔒 Security password was updated successfully.');
    } catch (err) {
      toast(err.message || 'Failed to update password.');
    }
  }

  // --- Notifications Synchronization ---
  async function syncServerNotifications() {
    if (!state.token) return;
    try {
      const serverNotifs = await api('/notifications');
      if (Array.isArray(serverNotifs)) {
        const local = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
        serverNotifs.forEach(sn => {
          const titleAndMsg = sn.title ? `${sn.title}: ${sn.message}` : sn.message;
          const exists = local.some(l => l.serverId === sn.id || l.msg === titleAndMsg);
          if (!exists) {
            local.push({
              serverId: sn.id,
              msg: titleAndMsg,
              time: new Date(sn.created_at || sn.createdAt).getTime() || Date.now(),
              read: !!(sn.is_read || sn.isRead)
            });
          }
        });
        local.sort((a,b) => b.time - a.time);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(local.slice(0, 40)));
        if (window.renderNotifs) window.renderNotifs();
        updateNotificationBadge();
      }
    } catch (e) {}
  }

  function updateNotificationBadge() {
    try {
      const list = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      const unreadCount = list.filter(n => !n.read).length;
      const badge = $('notifBadge');
      if (badge) {
        if (unreadCount > 0) {
          badge.style.display = 'flex';
          badge.className = unreadCount > 9 ? 'count-badge' : '';
          badge.textContent = unreadCount > 9 ? '9+' : (unreadCount > 1 ? String(unreadCount) : '');
        } else {
          badge.style.display = 'none';
          badge.textContent = '';
        }
      }
    } catch (e) {}
  }

  function initProfileAndSettingsUI() {
    $('myProfileButton')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openProfileModal();
    });
    $('profileModalClose')?.addEventListener('click', closeProfileModal);
    $('profileModalCancel')?.addEventListener('click', closeProfileModal);
    $('profileForm')?.addEventListener('submit', handleProfileSubmit);

    $('settingsButton')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openSettingsModal();
    });
    $('settingsModalClose')?.addEventListener('click', closeSettingsModal);
    $('settingsTabPref')?.addEventListener('click', () => switchSettingsTab('pref'));
    $('settingsTabSec')?.addEventListener('click', () => switchSettingsTab('sec'));
    $('settingsPrefForm')?.addEventListener('submit', handleSettingsPrefSubmit);
    $('settingsPasswordForm')?.addEventListener('submit', handlePasswordChange);

    $('profileModal')?.addEventListener('click', e => {
      if (e.target === $('profileModal')) closeProfileModal();
    });
    $('settingsModal')?.addEventListener('click', e => {
      if (e.target === $('settingsModal')) closeSettingsModal();
    });

    const notifBtn = $('notificationButton') || document.querySelector('.dashboard-notification');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        if (state.token) {
          api('/notifications/read-all', { method: 'POST' }).catch(() => {});
        }
        setTimeout(updateNotificationBadge, 200);
      });
    }

    document.addEventListener('click', e => {
      if (e.target?.id === 'notifClear') {
        if (state.token) {
          api('/notifications/clear', { method: 'DELETE' }).catch(() => {});
        }
        setTimeout(updateNotificationBadge, 100);
      }
    });

    // Populate default vehicle in booking if configured
    const originalOpenBookingDetails = window.openBookingDetailsModal;
    if (typeof originalOpenBookingDetails === 'function') {
      window.openBookingDetailsModal = function(parking, slotId, amount) {
        originalOpenBookingDetails(parking, slotId, amount);
        const s = getSavedSettings();
        if (s.vehicleNumber && $('bookingCarNumber')) {
          $('bookingCarNumber').value = s.vehicleNumber;
        }
      };
    }

    updateNotificationBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileAndSettingsUI, { once: true });
  } else {
    initProfileAndSettingsUI();
  }

  async function bootstrapDashboard(){
    try{
      if(!state.token) throw new Error('Please login first.');
      syncProfile();
      await refreshBookings();
      initMap();
      if(window.showDashboard) window.showDashboard();
      $('dashboardSection') && ($('dashboardSection').hidden=false);
      $('parkingSlotsPage') && ($('parkingSlotsPage').hidden=true);
      $('parkingList') && ($('parkingList').innerHTML='<div class="no-parking parking-location-prompt"><h3>📍 Select a location to find parking</h3><p>Use <strong>Current Location</strong> or search for an area, city or locality.</p></div>');
      $('parkingCount') && ($('parkingCount').textContent='0 locations');
      await renderPayments(); await renderLogs();
      await syncServerNotifications();
      updateNotificationBadge();
    }catch(err){toast(err.message);}
  }

  // The old showDashboard can call our overridden data renderer after login.
  window.displayDashboardParking=renderParking;
  window.refreshSidebarPages=()=>{renderPayments();renderLogs();displayMyBookings();};

  // Auto-restore a valid server session if present.
  if(state.token) setTimeout(bootstrapDashboard,100);

  window.ParkSmartAPI={api,state,bootstrapDashboard,bookSelectedParkingSlot:()=>window.bookSelectedParkingSlot()};
})();
