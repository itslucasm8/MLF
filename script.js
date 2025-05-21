// WHV 88-Day Visa Calculator Tool JavaScript
// Refactored for maintainability and extensibility

// --- Config: Feedback messages, colors, etc. ---
const FEEDBACK = {
  startDateRequired: 'Veuillez sélectionner une date de début.',
  endDateRequired: 'Veuillez sélectionner une date de fin.',
  endDateBeforeStart: 'La date de fin ne peut pas être antérieure à la date de début.',
  postcodeRequired: 'Veuillez saisir un code postal.',
  postcodeInvalid: '❌ Code postal invalide',
  postcodeValid: '✅ Code postal éligible',
  jobTypeRequired: 'Veuillez sélectionner un type d\'emploi.',
  jobTypeInvalid: '❌ Type d\'emploi non éligible.',
  jobTypeHospitalityInvalid: '❌ Le tourisme et l\'hôtellerie ne comptent que dans le nord de l\'Australie.',
  jobTypeValid: '✅ Type d\'emploi éligible.',
  hoursRequired: 'Veuillez saisir le nombre d\'heures travaillées (0 ou plus).',
  hoursPartial: 'Moins de 30 heures : semaine partielle comptabilisée.',
  hoursFull: 'Semaine complète comptabilisée (7 jours).',
  rowCounted: jours => `✅ ${jours} jours comptés`,
  rowCountedPartial: jours => `✅ ${jours} jours comptés (partiel)`,
  rowNone: '❌ Aucun jour compté',
  rowInvalid: '❌ Ligne invalide, non comptée',
};
const COLORS = {
  valid: '#43e97b',
  invalid: '#d32f2f',
};

// --- Official WHV Specified Work Job Types ---
const JOB_TYPES = [
  'Plant and animal cultivation',
  'Fishing and pearling',
  'Tree farming and felling',
  'Mining',
  'Construction',
  'Bushfire recovery work',
  'Flood recovery work',
  'Tourism and hospitality'
];

// --- Official Eligible Postcodes for Specified Work (Full List) ---
// Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/working-holiday-417/specified-work-conditions#eligible
// NT: all 08xx, ACT: all 26xx, 29xx
const ELIGIBLE_POSTCODES = [
  // Australian Capital Territory
  ...Array.from({length: 100}, (_, i) => (2600 + i).toString()),
  ...Array.from({length: 100}, (_, i) => (2900 + i).toString()),
  // New South Wales
  '2311','2312','2328','2329','2330','2333','2336','2337','2338','2339','2340','2341','2342','2343','2344','2345','2346','2347','2348','2350','2352','2353','2354','2355','2356','2357','2358','2359','2360','2361','2365','2369','2370','2371','2372','2380','2381','2382','2386','2387','2388','2390','2395','2396','2397','2398','2399','2400','2401','2402','2403','2404','2405','2406','2408','2409','2410','2411','2415','2420','2421','2422','2423','2424','2425','2426','2427','2428','2429','2430','2431','2439','2440','2441','2442','2443','2444','2445','2446','2447','2448','2449','2450','2452','2453','2454','2455','2456','2460','2462','2463','2464','2465','2466','2469','2470','2471','2472','2473','2474','2475','2476','2477','2478','2479','2480','2481','2482','2483','2484','2485','2486','2487','2488','2489','2490','2536','2537','2538','2539','2540','2541','2545','2546','2548','2549','2550','2551','2555','2556','2557','2558','2559','2575','2576','2577','2578','2579','2580','2581','2582','2583','2584','2585','2586','2587','2588','2589','2590','2594','2618','2619','2620','2621','2622','2623','2624','2625','2626','2627','2628','2629','2630','2631','2632','2633','2640','2641','2642','2643','2644','2645','2646','2647','2648','2649','2650','2651','2652','2653','2655','2656','2658','2659','2660','2661','2663','2665','2666','2668','2669','2671','2672','2675','2676','2678','2680','2681','2700','2701','2702','2703','2705','2706','2707','2708','2710','2711','2712','2713','2714','2715','2716','2720','2721','2722','2725','2726','2727','2729','2730','2731','2732','2733','2734','2735','2736','2737','2738','2739','2745','2747','2748','2749','2750','2751','2752','2753','2754','2755','2756','2757','2758','2759','2760','2761','2762','2763','2765','2766','2767','2768','2769','2770','2773','2774','2775','2776','2777','2778','2779','2780','2782','2783','2784','2785','2786','2787','2789','2790','2791','2792','2793','2794','2795','2797','2798','2799','2800','2803','2804','2805','2806','2807','2808','2809','2810','2817','2818','2819','2820','2821','2822','2823','2824','2825','2826','2827','2828','2829','2830','2831','2832','2833','2834','2835','2836','2839','2840','2842','2843','2844','2845','2846','2847','2848','2849','2850','2852','2853','2854','2864','2865','2866','2867','2868','2869','2870','2871','2873','2874','2875','2876','2877','2878','2879','2880','2881','2882','2883','2884','2885','2886','2887','2888','2889','2890','2891','2892','2893','2894','2895','2896','2897','2898','2899',
  // Northern Territory: all 08xx
  ...Array.from({length: 100}, (_, i) => (800 + i).toString().padStart(4, '0')),
  ...Array.from({length: 100}, (_, i) => (900 + i).toString().padStart(4, '0')),
  // Queensland
  '4124','4125','4133','4211','4270','4271','4272','4275','4280','4285','4287','4307','4309','4310','4311','4312','4313','4314','4317','4318','4319','4340','4341','4342','4343','4344','4346','4347','4350','4351','4352','4353','4354','4355','4356','4357','4358','4359','4360','4361','4362','4363','4364','4365','4366','4370','4371','4372','4373','4374','4375','4376','4377','4378','4380','4381','4382','4383','4384','4385','4386','4387','4388','4389','4390','4400','4401','4402','4403','4404','4405','4406','4407','4408','4410','4411','4412','4413','4415','4416','4417','4418','4419','4420','4421','4422','4423','4424','4425','4426','4427','4428','4429','4430','4431','4432','4433','4434','4435','4436','4437','4438','4439','4440','4441','4442','4443','4444','4445','4446','4447','4448','4449','4450','4451','4452','4453','4454','4455','4456','4457','4458','4459','4460','4461','4462','4463','4464','4465','4466','4467','4468','4469','4470','4471','4472','4473','4474','4475','4476','4477','4478','4479','4480','4481','4482','4486','4492','4493','4494','4496','4498','4499','4581','4605','4606','4608','4610','4611','4612','4613','4614','4615','4620','4621','4625','4626','4627','4630','4650','4655','4659','4660','4662','4670','4671','4673','4674','4676','4677','4678','4680','4694','4695','4697','4699','4702','4703','4704','4705','4706','4707','4709','4710','4711','4712','4713','4714','4715','4716','4717','4718','4719','4720','4721','4722','4723','4724','4725','4726','4727','4728','4729','4730','4731','4732','4733','4735','4736','4737','4738','4739','4740','4741','4742','4743','4744','4745','4746','4747','4748','4749','4750','4751','4753','4754','4756','4757','4758','4759','4760','4800','4801','4802','4803','4804','4805','4806','4807','4808','4809','4810','4811','4812','4814','4815','4816','4817','4818','4819','4820','4821','4822','4823','4824','4825','4828','4829','4830','4849','4850','4852','4854','4855','4856','4858','4859','4860','4861','4865','4868','4869','4870','4871','4872','4873','4874','4875','4876','4877','4878','4879','4880','4881','4882','4883','4884','4885','4886','4887','4888','4889','4890','4891','4892','4895','4898','4899',
  // South Australia
  '5000','5006','5007','5008','5009','5010','5011','5012','5013','5014','5015','5016','5017','5018','5019','5020','5021','5022','5023','5024','5025','5026','5027','5028','5029','5031','5032','5033','5034','5035','5036','5037','5038','5039','5040','5041','5042','5043','5044','5045','5046','5047','5048','5049','5050','5051','5052','5053','5054','5055','5056','5057','5058','5059','5060','5061','5062','5063','5064','5065','5066','5067','5068','5069','5070','5071','5072','5073','5074','5075','5076','5077','5078','5079','5080','5081','5082','5083','5084','5085','5086','5087','5088','5089','5090','5091','5092','5093','5094','5095','5096','5097','5098','5099','5100','5101','5102','5103','5104','5105','5106','5107','5108','5109','5110','5111','5112','5113','5114','5115','5116','5117','5118','5119','5120','5121','5122','5123','5124','5125','5126','5127','5128','5129','5130','5131','5132','5133','5134','5135','5136','5137','5138','5139','5140','5141','5142','5143','5144','5145','5146','5147','5148','5149','5150','5151','5152','5153','5154','5155','5156','5157','5158','5159','5160','5161','5162','5163','5164','5165','5166','5167','5168','5169','5170','5171','5172','5173','5174','5175','5176','5177','5178','5179','5180','5181','5182','5183','5184','5185','5186','5187','5188','5189','5190','5191','5192','5193','5194','5195','5196','5197','5198','5199',
  // Tasmania
  '7000','7004','7005','7007','7008','7009','7010','7011','7012','7015','7016','7017','7018','7019','7020','7021','7022','7023','7024','7025','7026','7027','7028','7029','7030','7031','7032','7033','7034','7035','7036','7037','7038','7039','7040','7041','7042','7043','7044','7045','7046','7047','7048','7049','7050','7051','7052','7053','7054','7055','7056','7057','7058','7059','7060','7061','7062','7063','7064','7065','7066','7067','7068','7069','7070','7071','7072','7073','7074','7075','7076','7077','7078','7079','7080','7081','7082','7083','7084','7085','7086','7087','7088','7089','7090','7091','7092','7093','7094','7095','7096','7097','7098','7099',
  // Victoria
  '3139','3211','3212','3213','3214','3215','3216','3217','3218','3219','3220','3221','3222','3223','3224','3225','3226','3227','3228','3230','3231','3232','3233','3234','3235','3236','3237','3238','3239','3240','3241','3242','3243','3249','3250','3251','3254','3260','3264','3265','3266','3267','3268','3269','3270','3271','3272','3273','3274','3275','3276','3277','3278','3279','3280','3281','3282','3283','3284','3285','3286','3287','3290','3292','3293','3294','3297','3298','3299','3300','3301','3302','3303','3304','3305','3309','3310','3311','3312','3314','3315','3317','3318','3319','3321','3322','3323','3324','3325','3328','3329','3330','3331','3332','3333','3334','3335','3337','3338','3340','3341','3342','3345','3350','3351','3352','3355','3356','3357','3360','3361','3363','3364','3370','3371','3373','3374','3375','3376','3377','3378','3379','3380','3381','3384','3385','3387','3388','3390','3391','3392','3393','3395','3396','3397','3398','3400','3401','3402','3407','3408','3409','3412','3413','3414','3415','3418','3419','3420','3423','3424','3427','3428','3429','3430','3431','3432','3433','3434','3435','3437','3438','3440','3441','3442','3444','3446','3447','3448','3450','3451','3453','3458','3460','3461','3462','3463','3464','3465','3467','3468','3469','3472','3475','3477','3478','3479','3480','3482','3483','3485','3487','3488','3489','3490','3491','3494','3496','3498','3500','3501','3505','3506','3507','3509','3512','3515','3516','3517','3518','3520','3521','3522','3523','3525','3527','3529','3530','3531','3533','3537','3540','3542','3544','3546','3549','3550','3551','3552','3553','3554','3555','3556','3557','3558','3559','3561','3562','3563','3564','3565','3566','3567','3568','3570','3571','3572','3573','3575','3576','3579','3580','3581','3583','3584','3585','3586','3588','3589','3590','3591','3594','3595','3596','3597','3599','3607','3608','3610','3612','3614','3616','3617','3618','3620','3621','3622','3623','3624','3629','3630','3631','3632','3633','3634','3635','3636','3637','3638','3639','3640','3641','3644','3646','3647','3649','3658','3659','3660','3662','3663','3664','3665','3666','3669','3670','3672','3673','3675','3677','3678','3682','3683','3685','3687','3688','3690','3691','3694','3695','3697','3698','3699',
  // Western Australia
  '6041','6042','6043','6044','6045','6046','6047','6048','6049','6050','6051','6052','6053','6054','6055','6056','6057','6058','6059','6060','6061','6062','6063','6064','6065','6066','6067','6068','6069','6070','6071','6072','6073','6074','6075','6076','6077','6078','6079','6080','6081','6082','6083','6084','6085','6086','6087','6088','6089','6090','6091','6092','6093','6094','6095','6096','6097','6098','6099','6100','6101','6102','6103','6104','6105','6106','6107','6108','6109','6110','6111','6112','6113','6114','6115','6116','6117','6118','6119','6120','6121','6122','6123','6124','6125','6126','6127','6128','6129','6130','6131','6132','6133','6134','6135','6136','6137','6138','6139','6140','6141','6142','6143','6144','6145','6146','6147','6148','6149','6150','6151','6152','6153','6154','6155','6156','6157','6158','6159','6160','6161','6162','6163','6164','6165','6166','6167','6168','6169','6170','6171','6172','6173','6174','6175','6176','6177','6178','6179','6180','6181','6182','6183','6184','6185','6186','6187','6188','6189','6190','6191','6192','6193','6194','6195','6196','6197','6198','6199','6200','6201','6202','6203','6204','6205','6206','6207','6208','6209','6210','6211','6212','6213','6214','6215','6216','6217','6218','6219','6220','6221','6222','6223','6224','6225','6226','6227','6228','6229','6230','6231','6232','6233','6234','6235','6236','6237','6238','6239','6240','6241','6242','6243','6244','6245','6246','6247','6248','6249','6250','6251','6252','6253','6254','6255','6256','6257','6258','6259','6260','6261','6262','6263','6264','6265','6266','6267','6268','6269','6270','6271','6272','6273','6274','6275','6276','6277','6278','6279','6280','6281','6282','6283','6284','6285','6286','6287','6288','6289','6290','6291','6292','6293','6294','6295','6296','6297','6298','6299','6300','6301','6302','6303','6304','6305','6306','6307','6308','6309','6310','6311','6312','6313','6314','6315','6316','6317','6318','6319','6320','6321','6322','6323','6324','6325','6326','6327','6328','6329','6330','6331','6332','6333','6334','6335','6336','6337','6338','6339','6340','6341','6342','6343','6344','6345','6346','6347','6348','6349','6350','6351','6352','6353','6354','6355','6356','6357','6358','6359','6360','6361','6362','6363','6364','6365','6366','6367','6368','6369','6370','6371','6372','6373','6374','6375','6376','6377','6378','6379','6380','6381','6382','6383','6384','6385','6386','6387','6388','6389','6390','6391','6392','6393','6394','6395','6396','6397','6398','6399','6400','6401','6402','6403','6404','6405','6406','6407','6408','6409','6410','6411','6412','6413','6414','6415','6416','6417','6418','6419','6420','6421','6422','6423','6424','6425','6426','6427','6428','6429','6430','6431','6432','6433','6434','6435','6436','6437','6438','6439','6440','6441','6442','6443','6444','6445','6446','6447','6448','6449','6450','6451','6452','6453','6454','6455','6456','6457','6458','6459','6460','6461','6462','6463','6464','6465','6466','6467','6468','6469','6470','6471','6472','6473','6474','6475','6476','6477','6478','6479','6480','6481','6482','6483','6484','6485','6486','6487','6488','6489','6490','6491','6492','6493','6494','6495','6496','6497','6498','6499','6500','6501','6502','6503','6504','6505','6506','6507','6508','6509','6510','6511','6512','6513','6514','6515','6516','6517','6518','6519','6520','6521','6522','6523','6524','6525','6526','6527','6528','6529','6530','6531','6532','6533','6534','6535','6536','6537','6538','6539','6540','6541','6542','6543','6544','6545','6546','6547','6548','6549','6550','6551','6552','6553','6554','6555','6556','6557','6558','6559','6560','6561','6562','6563','6564','6565','6566','6567','6568','6569','6570','6571','6572','6573','6574','6575','6576','6577','6578','6579','6580','6581','6582','6583','6584','6585','6586','6587','6588','6589','6590','6591','6592','6593','6594','6595','6596','6597','6598','6599','6600','6601','6602','6603','6604','6605','6606','6607','6608','6609','6610','6611','6612','6613','6614','6615','6616','6617','6618','6619','6620','6621','6622','6623','6624','6625','6626','6627','6628','6629','6630','6631','6632','6633','6634','6635','6636','6637','6638','6639','6640','6641','6642','6643','6644','6645','6646','6647','6648','6649','6650','6651','6652','6653','6654','6655','6656','6657','6658','6659','6660','6661','6662','6663','6664','6665','6666','6667','6668','6669','6670','6671','6672','6673','6674','6675','6676','6677','6678','6679','6680','6681','6682','6683','6684','6685','6686','6687','6688','6689','6690','6691','6692','6693','6694','6695','6696','6697','6698','6699','6700','6701','6702','6703','6704','6705','6706','6707','6708','6709','6710','6711','6712','6713','6714','6715','6716','6717','6718','6719','6720','6721','6722','6723','6724','6725','6726','6727','6728','6729','6730','6731','6732','6733','6740','6743','6751','6753','6754','6758','6760','6762','6765','6770','6771','6772','6773','6798','6799'
];

// --- Northern Australia Postcodes for Tourism & Hospitality ---
// (NT: all 08xx, QLD/WA: as above)
const NA_POSTCODES = [
  // NT: all 08xx
  ...Array.from({length: 100}, (_, i) => (800 + i).toString().padStart(4, '0')),
  ...Array.from({length: 100}, (_, i) => (900 + i).toString().padStart(4, '0')),
  // QLD/WA: as above
  '0872','0880','0881','0882','0883','0884','0885','0886','0887','0888','0889','0890','0891','0892','0893','0894','0895','0896','0897','0898','0899','4472','4477','4478','4481','4482','4486','4492','4493','4494','4496','4498','4499','4581','4605','4606','4608','4610','4611','4612','4613','4614','4615','4620','4621','4625','4626','4627','4630','4650','4655','4659','4660','4662','4670','4671','4673','4674','4676','4677','4678','4680','4694','4695','4697','4699','4702','4703','4704','4705','4706','4707','4709','4710','4711','4712','4713','4714','4715','4716','4717','4718','4719','4720','4721','4722','4723','4724','4725','4726','4727','4728','4729','4730','4731','4732','4733','4735','4736','4737','4738','4739','4740','4741','4742','4743','4744','4745','4746','4747','4748','4749','4750','4751','4753','4754','4756','4757','4758','4759','4760','4800','4801','4802','4803','4804','4805','4806','4807','4808','4809','4810','4811','4812','4814','4815','4816','4817','4818','4819','4820','4821','4822','4823','4824','4825','4828','4829','4830','4849','4850','4852','4854','4855','4856','4858','4859','4860','4861','4865','4868','4869','4870','4871','4872','4873','4874','4875','4876','4877','4878','4879','4880','4881','4882','4883','4884','4885','4886','4887','4888','4889','4890','4891','4892','4895','4898','4899','6701','6702','6703','6704','6705','6706','6707','6708','6709','6710','6711','6712','6713','6714','6715','6716','6717','6718','6719','6720','6721','6722','6723','6724','6725','6726','6727','6728','6729','6730','6731','6732','6733','6740','6743','6751','6753','6754','6758','6760','6762','6765','6770','6771','6772','6773','6798','6799'
];

const VISA_DAYS_TARGET = 88;

// --- DOM Elements ---
const calculator = document.getElementById('visa-calculator');
const weeksEntries = calculator.querySelector('#weeks-entries');
const addWeekBtn = calculator.querySelector('#add-week-btn');
const progressBar = calculator.querySelector('#progress-bar');
const progressText = calculator.querySelector('#progress-text');
const collapseAllBtn = calculator.querySelector('#collapse-all-btn');

// --- Populate job type dropdowns ---
function populateJobTypeDropdown(select) {
  const JOB_TYPES_FR = [
    'Culture de plantes et élevage d\'animaux',
    'Pêche et culture de perles',
    'Sylviculture et abattage',
    'Mines',
    'Construction',
    'Travaux de récupération après incendie',
    'Travaux de récupération après inondation',
    'Tourisme et hôtellerie'
  ];
  select.innerHTML = '<option value="">Sélectionnez le type d\'emploi</option>' +
    JOB_TYPES_FR.map((j, i) => `<option value="${JOB_TYPES[i]}">${j}</option>`).join('');
}
// Populate initial row
populateJobTypeDropdown(calculator.querySelector('.job-type'));

// --- Add/Remove week entry logic ---
addWeekBtn.addEventListener('click', () => {
  const idx = weeksEntries.children.length;
  const template = weeksEntries.children[0];
  const clone = template.cloneNode(true);
  clone.setAttribute('data-index', idx);
  // Prefill postcode/job type from last entry
  if (weeksEntries.children.length > 0) {
    const last = weeksEntries.children[weeksEntries.children.length - 1];
    clone.querySelector('.postcode').value = last.querySelector('.postcode').value;
    clone.querySelector('.job-type').value = last.querySelector('.job-type').value;
  }
  // Reset other values
  clone.querySelectorAll('input, select').forEach(el => {
    if (el.classList.contains('postcode') || el.classList.contains('job-type')) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  // Remove any previous error states and feedback
  clone.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  clone.querySelectorAll('.valid-msg, .invalid-msg').forEach(fb => { fb.textContent = ''; fb.classList.remove('valid-msg', 'invalid-msg'); });
  // Remove row feedback if present
  const oldFeedback = clone.querySelector('.row-feedback');
  if (oldFeedback) oldFeedback.remove();
  // Attach event listeners
  populateJobTypeDropdown(clone.querySelector('.job-type'));
  clone.querySelector('.remove-week').addEventListener('click', removeWeekHandler);
  // Insert
  weeksEntries.appendChild(clone);
  updateAll();
  expandEntry(clone);
});
function removeWeekHandler(e) {
  if (weeksEntries.children.length > 1) {
    e.target.closest('.entry').remove();
    updateAll();
  }
}
// Attach remove handler to initial row
weeksEntries.querySelector('.remove-week').addEventListener('click', removeWeekHandler);

// --- Validation and Calculation ---
function isEligiblePostcode(pc) {
  return ELIGIBLE_POSTCODES.includes(pc);
}
function isHospitalityAllowed(pc) {
  return NA_POSTCODES.includes(pc);
}
function isEligibleJobType(jt) {
  return JOB_TYPES.includes(jt);
}
function calculateVisaDays(hours) {
  if (hours >= 30) return 7;
  if (hours > 0) return Math.min(7, (hours / 30) * 7);
  return 0;
}

// --- Debounce utility ---
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function updateAll() {
  let totalVisaDays = 0;
  Array.from(weeksEntries.children).forEach((entry, idx) => {
    // Remove previous error states and feedback
    entry.querySelectorAll('input, select').forEach(el => el.classList.remove('invalid'));
    entry.querySelectorAll('.valid-msg, .invalid-msg').forEach(fb => { fb.textContent = ''; fb.classList.remove('valid-msg', 'invalid-msg'); });
    // Remove or create row feedback
    let rowFeedback = entry.querySelector('.row-feedback');
    if (!rowFeedback) {
      rowFeedback = document.createElement('div');
      rowFeedback.className = 'row-feedback';
      rowFeedback.setAttribute('aria-live', 'polite');
      rowFeedback.style.fontSize = '0.85em';
      rowFeedback.style.margin = '0.2em 0 0.1em 0';
      rowFeedback.style.fontWeight = '500';
      entry.appendChild(rowFeedback);
    } else {
      rowFeedback.textContent = '';
      rowFeedback.className = 'row-feedback';
      rowFeedback.setAttribute('aria-live', 'polite');
    }
    // Get values
    const postcode = entry.querySelector('.postcode').value.trim();
    const jobType = entry.querySelector('.job-type').value;
    const hours = parseFloat(entry.querySelector('.hours-worked').value);
    const startDate = entry.querySelector('.start-date').value;
    const endDate = entry.querySelector('.end-date').value;
    let valid = true;
    // Validate start date
    if (!startDate) {
      entry.querySelector('.start-date-feedback').textContent = FEEDBACK.startDateRequired;
      entry.querySelector('.start-date-feedback').classList.add('invalid-msg');
      valid = false;
    } else {
      entry.querySelector('.start-date-feedback').textContent = '';
      entry.querySelector('.start-date-feedback').classList.add('valid-msg');
    }
    // Validate end date
    if (!endDate) {
      entry.querySelector('.end-date-feedback').textContent = FEEDBACK.endDateRequired;
      entry.querySelector('.end-date-feedback').classList.add('invalid-msg');
      valid = false;
    } else if (startDate && endDate < startDate) {
      entry.querySelector('.end-date-feedback').textContent = FEEDBACK.endDateBeforeStart;
      entry.querySelector('.end-date-feedback').classList.add('invalid-msg');
      valid = false;
    } else {
      entry.querySelector('.end-date-feedback').textContent = '';
      entry.querySelector('.end-date-feedback').classList.add('valid-msg');
    }
    // Validate postcode
    if (!postcode) {
      entry.querySelector('.postcode-feedback').textContent = FEEDBACK.postcodeRequired;
      entry.querySelector('.postcode-feedback').classList.add('invalid-msg');
      valid = false;
    } else if (!isEligiblePostcode(postcode)) {
      entry.querySelector('.postcode-feedback').textContent = FEEDBACK.postcodeInvalid;
      entry.querySelector('.postcode-feedback').classList.add('invalid-msg');
      entry.querySelector('.postcode').classList.add('invalid');
      valid = false;
    } else {
      entry.querySelector('.postcode-feedback').textContent = FEEDBACK.postcodeValid;
      entry.querySelector('.postcode-feedback').classList.add('valid-msg');
    }
    // Validate job type
    if (!jobType) {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeRequired;
      entry.querySelector('.job-type-feedback').classList.add('invalid-msg');
      valid = false;
    } else if (!isEligibleJobType(jobType)) {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeInvalid;
      entry.querySelector('.job-type-feedback').classList.add('invalid-msg');
      entry.querySelector('.job-type').classList.add('invalid');
      valid = false;
    } else if (jobType === 'Tourism and hospitality' && !isHospitalityAllowed(postcode)) {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeHospitalityInvalid;
      entry.querySelector('.job-type-feedback').classList.add('invalid-msg');
      entry.querySelector('.job-type').classList.add('invalid');
      entry.querySelector('.postcode').classList.add('invalid');
      valid = false;
    } else {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeValid;
      entry.querySelector('.job-type-feedback').classList.add('valid-msg');
    }
    // Validate hours
    let visaDays = 0;
    if (isNaN(hours) || hours < 0) {
      entry.querySelector('.hours-worked-feedback').textContent = FEEDBACK.hoursRequired;
      entry.querySelector('.hours-worked-feedback').classList.add('invalid-msg');
      entry.querySelector('.hours-worked').classList.add('invalid');
      valid = false;
    } else if (hours > 0 && hours < 30) {
      entry.querySelector('.hours-worked-feedback').textContent = FEEDBACK.hoursPartial;
      entry.querySelector('.hours-worked-feedback').classList.add('valid-msg');
      visaDays = Math.min(7, (hours / 30) * 7);
    } else if (hours >= 30) {
      entry.querySelector('.hours-worked-feedback').textContent = FEEDBACK.hoursFull;
      entry.querySelector('.hours-worked-feedback').classList.add('valid-msg');
      visaDays = 7;
    } else {
      entry.querySelector('.hours-worked-feedback').textContent = '';
      entry.querySelector('.hours-worked-feedback').classList.add('valid-msg');
    }
    // Show row feedback and count visa days only if valid
    if (valid) {
      if (visaDays >= 7) {
        rowFeedback.textContent = FEEDBACK.rowCounted(visaDays.toFixed(0));
        rowFeedback.style.color = COLORS.valid;
      } else if (visaDays > 0) {
        rowFeedback.textContent = FEEDBACK.rowCountedPartial(visaDays.toFixed(2));
        rowFeedback.style.color = COLORS.valid;
      } else {
        rowFeedback.textContent = FEEDBACK.rowNone;
        rowFeedback.style.color = COLORS.invalid;
      }
      totalVisaDays += visaDays;
    } else {
      rowFeedback.textContent = FEEDBACK.rowInvalid;
      rowFeedback.style.color = COLORS.invalid;
    }
    entry.setAttribute('data-visa-days', valid ? visaDays : 0);
    // Remove button visibility
    const removeBtn = entry.querySelector('.remove-week');
    removeBtn.style.display = (weeksEntries.children.length > 1) ? '' : 'none';
  });
  // Update progress
  const percent = Math.min(100, (totalVisaDays / VISA_DAYS_TARGET) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = `${Math.round(totalVisaDays)} / ${VISA_DAYS_TARGET} jours de visa complétés`;
}

// --- Listen for changes (debounced) ---
const debouncedUpdateAll = debounce(updateAll, 80);
weeksEntries.addEventListener('input', debouncedUpdateAll);
weeksEntries.addEventListener('change', debouncedUpdateAll);

// --- Optional: style invalid fields ---
const style = document.createElement('style');
style.textContent = `.invalid { border-color: #d32f2f !important; background: #fff0f0 !important; }`;
document.head.appendChild(style);

// Initial calculation
updateAll();

// --- Collapse/Expand logic ---
function getEntrySummary(entry) {
  const start = entry.querySelector('.start-date').value;
  const end = entry.querySelector('.end-date').value;
  const jobType = entry.querySelector('.job-type');
  const jobTypeLabel = jobType.options[jobType.selectedIndex]?.textContent || '';
  const visaDays = entry.getAttribute('data-visa-days') || '0';
  return `<span><i class='fa-regular fa-calendar-days'></i> ${start || '—'} → <i class='fa-regular fa-calendar-check'></i> ${end || '—'}</span>
    <span><i class='fa-solid fa-briefcase'></i> ${jobTypeLabel}</span>
    <span class='summary-days'><i class='fa-regular fa-clock'></i> ${visaDays} jours</span>
    <button type='button' class='entry-toggle' aria-label='Développer'><i class='fa-solid fa-chevron-down'></i></button>
    <button type='button' class='summary-edit' aria-label='Modifier'><i class='fa-solid fa-pen'></i> Modifier</button>`;
}
function collapseEntry(entry) {
  entry.classList.add('collapsed');
  let summary = entry.querySelector('.entry-summary');
  if (!summary) {
    summary = document.createElement('div');
    summary.className = 'entry-summary';
    entry.prepend(summary);
  }
  summary.innerHTML = getEntrySummary(entry);
}
function expandEntry(entry) {
  entry.classList.remove('collapsed');
}
// Toggle collapse/expand for a single entry
weeksEntries.addEventListener('click', function(e) {
  if (e.target.closest('.entry-toggle')) {
    const entry = e.target.closest('.entry');
    if (entry.classList.contains('collapsed')) expandEntry(entry);
    else collapseEntry(entry);
  }
  if (e.target.closest('.summary-edit')) {
    const entry = e.target.closest('.entry');
    expandEntry(entry);
  }
});

// Toggle collapse/expand for all entries
let allCollapsed = false;
collapseAllBtn.addEventListener('click', () => {
  const entries = Array.from(weeksEntries.children);
  if (allCollapsed) {
    entries.forEach(expandEntry);
    collapseAllBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Tout réduire';
  } else {
    entries.forEach(collapseEntry);
    collapseAllBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Tout développer';
  }
  allCollapsed = !allCollapsed;
});
// When adding a new week, prefill postcode/job type from last entry if present
addWeekBtn.addEventListener('click', () => {
  const idx = weeksEntries.children.length;
  const template = weeksEntries.children[0];
  const clone = template.cloneNode(true);
  clone.setAttribute('data-index', idx);
  // Prefill postcode/job type from last entry
  if (weeksEntries.children.length > 0) {
    const last = weeksEntries.children[weeksEntries.children.length - 1];
    clone.querySelector('.postcode').value = last.querySelector('.postcode').value;
    clone.querySelector('.job-type').value = last.querySelector('.job-type').value;
    // Auto-extend start date
    const prevEnd = last.querySelector('.end-date').value;
    if (prevEnd) {
      const nextStart = new Date(prevEnd);
      nextStart.setDate(nextStart.getDate() + 1);
      clone.querySelector('.start-date').value = nextStart.toISOString().slice(0,10);
    }
  }
  // Reset other values
  clone.querySelectorAll('input, select').forEach(el => {
    if (el.classList.contains('postcode') || el.classList.contains('job-type') || el.classList.contains('start-date')) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  // Remove any previous error states and feedback
  clone.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  clone.querySelectorAll('.valid-msg, .invalid-msg').forEach(fb => { fb.textContent = ''; fb.classList.remove('valid-msg', 'invalid-msg'); });
  // Remove row feedback if present
  const oldFeedback = clone.querySelector('.row-feedback');
  if (oldFeedback) oldFeedback.remove();
  // Attach event listeners
  populateJobTypeDropdown(clone.querySelector('.job-type'));
  clone.querySelector('.remove-week').addEventListener('click', removeWeekHandler);
  // Insert
  weeksEntries.appendChild(clone);
  updateAll();
  expandEntry(clone);
});

// --- Business Preset Logic ---
let businessPreset = null;
function saveBusinessPreset(postcode, jobType) {
  businessPreset = { postcode, jobType };
}
function applyBusinessPreset(entry) {
  if (businessPreset) {
    entry.querySelector('.postcode').value = businessPreset.postcode;
    entry.querySelector('.job-type').value = businessPreset.jobType;
  }
}
// Add preset UI
const presetDiv = document.createElement('div');
presetDiv.style.display = 'flex';
presetDiv.style.gap = '0.7em';
presetDiv.style.marginBottom = '0.7em';
presetDiv.innerHTML = `
  <button type="button" id="save-preset-btn" class="mlf-btn mlf-btn-secondary"><i class="fa-solid fa-star"></i> Sauver comme entreprise</button>
  <button type="button" id="use-preset-btn" class="mlf-btn mlf-btn-secondary"><i class="fa-solid fa-building"></i> Remplir avec l'entreprise</button>
`;
const form = calculator.querySelector('#weeks-form');
form.insertBefore(presetDiv, form.querySelector('#collapse-all-space'));
document.getElementById('save-preset-btn').onclick = function() {
  const last = weeksEntries.lastElementChild;
  saveBusinessPreset(last.querySelector('.postcode').value, last.querySelector('.job-type').value);
  this.textContent = 'Entreprise sauvegardée !';
  setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-star"></i> Sauver comme entreprise'; }, 1500);
};
document.getElementById('use-preset-btn').onclick = function() {
  const last = weeksEntries.lastElementChild;
  applyBusinessPreset(last);
};
// --- Export CSV ---
const exportBtn = document.createElement('button');
exportBtn.type = 'button';
exportBtn.className = 'mlf-btn mlf-btn-secondary';
exportBtn.style.marginTop = '1.2em';
exportBtn.innerHTML = '<i class="fa-solid fa-file-csv"></i> Exporter (CSV)';
form.appendChild(exportBtn);
exportBtn.onclick = function() {
  let csv = 'Date de début,Date de fin,Code postal,Type d\'emploi,Heures travaillées,Jours visa\n';
  Array.from(weeksEntries.children).forEach(entry => {
    const start = entry.querySelector('.start-date').value;
    const end = entry.querySelector('.end-date').value;
    const postcode = entry.querySelector('.postcode').value;
    const jobType = entry.querySelector('.job-type');
    const jobTypeLabel = jobType.options[jobType.selectedIndex]?.textContent || '';
    const hours = entry.querySelector('.hours-worked').value;
    const visaDays = entry.getAttribute('data-visa-days') || '0';
    csv += `${start},${end},${postcode},${jobTypeLabel},${hours},${visaDays}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mes_88_jours.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 
