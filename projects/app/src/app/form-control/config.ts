import { DateInput, FileInput, FormConfigInterface, InputConfigInterface, InputGroup, InputTypes, OptionsInput, TextInput } from "@azlabsjs/smart-form-core";


// @internal
const WITHDRAWAL_REASONS = [{ value: 'DÉCÈS', name: 'DÉCÈS' }, { value: 'DIVORCE', name: 'DIVORCE' }, { value: 'ENFANT NON PRISE EN CHARGE', name: 'ENFANT NON PRISE EN CHARGE' }];

// @internal
export type DerivedTypeOf<T extends Object> = T & { [prop: string]: unknown };

// @internal
function _person(countries_url: string, minbirthdate: string | Date, maxbirthdate: string | Date) {
    return [
        {
            label: 'lastname',
            name: 'lastname',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            value: null,
            description: '',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: true, email: false, min: 1, max: 100 },
        } as TextInput,
        {
            label: 'firstname',
            name: 'firstname',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            value: null,
            description: '', // TODO: Add input description
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: true, email: false, min: 1, max: 100 },
        } as TextInput,
        {
            label: 'sex',
            name: 'sex',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            value: null,
            description: '', // TODO: Add input description
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [
                { name: 'FEMININ', value: 'F' },
                { name: 'MASCULIN', value: 'M' },
                // { name: 'AUTRES', value: 'O' }, // uncomment the line to add other as sex
            ],
            constraints: { required: true, disabled: false },
        } as OptionsInput,
        {
            label: 'birthdate',
            name: 'birthdate',
            type: 'date',
            classes: 'clr-input',
            placeholder: '...',
            value: null,
            description: '', // TODO: Add input description
            containerClass: 'input-col-sm-12 input-col-md-4',
            constraints: {
                required: true,
                min: minbirthdate,
                max: maxbirthdate,
            },
            minDate: minbirthdate,
            maxDate: maxbirthdate,
        } as DateInput,
        {
            label: 'nationality',
            name: 'nationality',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [],
            optionsConfig: {
                source: { resource: `${countries_url}?_sort=name`, raw: `${countries_url}?_sort=name` },
                params: { keyBy: 'alpha2', valueBy: 'name' },
            },
            value: 'TG',
            constraints: { required: true },
        } as OptionsInput,
    ] as InputConfigInterface[];
}


// @internal
function _address(subdivisions_url: string, agences_url: string, card_delivery_sites_url: string) {
    return [
        {
            label: '',
            name: 'address_header',
            type: 'html',
            classes: 'border-t border-slate-200 font-semibold text-slate-900 text-xs mt-1 pt-4',
            placeholder: '...',
            value: '<section>2. Lieu de résidence</section>',
            constraints: { required: false },
        } as InputConfigInterface,
        {
            label: 'region',
            name: 'region',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [],
            optionsConfig: {
                source: { resource: `${subdivisions_url}?subdivision_id=1`, raw: `${subdivisions_url}?subdivision_id=1`, },
                params: { keyBy: 'encoding', valueBy: 'value' }
            },
            constraints: { required: true },
        } as OptionsInput,
        {
            label: 'prefecture',
            name: 'prefecture',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [],
            optionsConfig: {
                source: { resource: `${subdivisions_url}?subdivision_id=2`, raw: `${subdivisions_url}?subdivision_id=2` },
                params: { keyBy: 'encoding', valueBy: 'value' },
                refetch: [
                    { trigger: 'region', query: 'parenting_bonds.p_country_subdivision_encoding' }
                ]
            },
            constraints: { required: true },
        } as OptionsInput,
        {
            label: 'municipality',
            name: 'municipality',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [],
            optionsConfig: {
                source: { resource: `${subdivisions_url}?subdivision_id=3`, raw: `${subdivisions_url}?subdivision_id=3` },
                params: { keyBy: 'encoding', valueBy: 'value' },
                refetch: [
                    { trigger: 'prefecture', query: 'parenting_bonds.p_country_subdivision_encoding' }
                ]
            },
            constraints: { required: true },
        } as OptionsInput,
        {
            label: 'city',
            name: 'city',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: true, disabled: false, min: 1 },
        } as TextInput,
        {
            label: 'district',
            name: 'district',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: false, min: 1 },
        } as TextInput,
        {
            label: '',
            name: 'contact_header',
            type: 'html',
            classes: 'border-t border-slate-200 font-semibold text-slate-900 text-xs mt-1 pt-4',
            placeholder: '...',
            value: '<section>3. Contacts</section>',
            constraints: { required: false },
        } as InputConfigInterface,
        {
            label: 'phonenumber',
            name: 'phonenumber',
            type: 'phone',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: true },
        } as TextInput,
        {
            label: 'email',
            name: 'email',
            type: 'email',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: false, email: true, max: 190 },
        } as TextInput,
        // {
        //     label: 'address',
        //     name: 'address',
        //     type: 'text',
        //     classes: 'clr-input',
        //     placeholder: '...',
        //     containerClass: 'input-col-sm-12 input-col-md-4',
        //     constraints: {
        //         required: false,
        //         email: false,
        //         max: 255,
        //     },
        // } as TextInput,
        {
            label: '',
            name: 'insurer_header',
            type: 'html',
            classes: 'border-t border-slate-200 font-semibold text-slate-900 text-xs mt-1 pt-4',
            placeholder: '...',
            value: '<section>4. Traitement et retrait de carte</section>',
            constraints: { required: false },
        } as InputConfigInterface,
        {
            label: 'agence',
            name: 'agence',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-6',
            options: [],
            optionsConfig: {
                source: { resource: `${agences_url}?archived=false`, raw: `${agences_url}?archived=false` },
                // params: { keyBy: 'encoding', valueBy: 'value' },
                refetch: []
            },
            constraints: { required: true },
        } as OptionsInput,
        {
            label: 'card_delivery_site',
            name: 'card_delivery_site',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-6',
            options: [],
            optionsConfig: {
                source: { resource: `${card_delivery_sites_url}?archived=false`, raw: `${card_delivery_sites_url}?archived=false` },
                // params: { keyBy: 'encoding', valueBy: 'value' },
                refetch: [{ trigger: 'agence', query: 'agence' }]
            },
            constraints: { required: false },
        } as OptionsInput,
    ] as InputConfigInterface[];
}

// @internal
export function beneficiary(photo_documents_api_url: string, identity_documents_api_url: string, mariage_certificates_url: string, school_certificates_url: string, upload_url: string, countries_url: string, subdivisions_api_url: string, agences_url: string, card_delivery_sites_url: string) {
    // TODO: add photo url
    return [
        {
            label: 'beneficiary_type_id',
            name: 'beneficiary_type_id',
            type: 'hidden',
            containerClass: 'input-col-sm-12 input-col-md-12',
            constraints: { required: false, disabled: true }
        } as InputConfigInterface,
        {
            label: 'policynumber',
            name: 'policynumber',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-4',
            constraints: { required: true, email: false, min: 1, max: 45, disabled: true },
        } as TextInput,
        {
            label: 'lastname',
            name: 'lastname',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-4',
            constraints: { required: true, email: false, min: 1, max: 100 },
        } as TextInput,
        {
            label: 'firstname',
            name: 'firstname',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-4',
            constraints: { required: true, email: false, min: 1, max: 100 },
        } as TextInput,
        {
            label: 'birthdate',
            name: 'birthdate',
            type: 'date',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-4',
            constraints: { required: true },
        } as DateInput,
        {
            label: 'sex',
            name: 'sex',
            type: 'select', // radio
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [
                { name: 'FEMININ', value: 'F' },
                { name: 'MASCULIN', value: 'M' },
                // { name: 'AUTRES', value: 'O' }, # uncomment this line to add other as sex
            ],
            constraints: {
                required: true,
                disabled: false,
            },
        } as OptionsInput,
        {
            label: 'nationality',
            name: 'nationality',
            type: 'select',
            classes: 'clr-input',
            placeholder: '...',
            isRepeatable: false,
            containerClass: 'input-col-sm-12 input-col-md-4',
            options: [],
            optionsConfig: {
                source: { resource: `${countries_url}?_sort=name`, raw: `${countries_url}?_sort=name` },
                params: { keyBy: 'alpha2', valueBy: 'name' },
            },
            value: 'TG',
            constraints: { required: true },
        } as OptionsInput,
        // {
        //     label: 'birthcountry',
        //     name: 'birthcountry',
        //     type: 'select',
        //     classes: 'clr-input',
        //     placeholder: '...',
        //     isRepeatable: false,
        //     containerClass: 'input-col-sm-12 input-col-md-4',
        //     options: [],
        //     optionsConfig: {
        //         source: { resource: `${countries_url}?_sort=name`, raw: `${countries_url}?_sort=name` },
        //         params: {
        //             keyBy: 'alpha2',
        //             valueBy: 'name',
        //         },
        //     },
        //     constraints: {
        //         required: true,
        //     },
        // } as OptionsInput,
        {
            label: 'phonenumber',
            name: 'phonenumber',
            type: 'phone',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: true },
        } as TextInput,
        {
            label: 'email',
            name: 'email',
            type: 'email',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-6',
            constraints: { required: false, email: true, max: 190 },
        } as TextInput,
        {
            name: 'document1',
            type: InputTypes.CONTROL_GROUP,
            containerClass: 'border bg-gray-50 border-dashed border-gray-400 px-4 mt-4 rounded-md',
            children: [
                {
                    label: 'photo',
                    name: 'document_id',
                    type: 'select',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: 'input-col-sm-12 input-col-md-6',
                    autoselect: true,
                    options: [],
                    optionsConfig: {
                        source: { resource: `${photo_documents_api_url}`, raw: `${photo_documents_api_url}` },
                        params: { keyBy: 'id', valueBy: 'label' },
                    },
                    constraints: { required: true, disabled: true },
                } as OptionsInput,
                {
                    label: 'upload_photo',
                    description: 'description',
                    name: 'url',
                    type: 'file',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: `input-col-sm-12 input-col-md-6`,
                    uploadAs: 'content',
                    read: 'url',
                    multiple: false,
                    maxFileSize: 10,
                    isRepeatable: false,
                    autoupload: true,
                    uploadUrl: upload_url,
                    pattern: 'image/jpeg,image/png,image/webp',
                    constraints: { max: 1, pattern: { fn: 'image/jpeg,image/png,image/webp' }, required: true },
                } as FileInput,
            ]
        },
        {
            name: 'document2',
            type: InputTypes.CONTROL_GROUP,
            containerClass: 'border bg-gray-50 border-dashed border-gray-400 px-4 mt-4 rounded-md',
            children: [
                {
                    label: 'identity_document',
                    name: 'document_id',
                    type: 'select',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: 'input-col-sm-12 input-col-md-6',
                    options: [],
                    optionsConfig: {
                        source: { resource: `${identity_documents_api_url}`, raw: `${identity_documents_api_url}` },
                        params: { keyBy: 'id', valueBy: 'label' },
                    },
                    constraints: { required: true },
                } as OptionsInput,
                {
                    label: 'upload_identity_document',
                    description: 'description',
                    name: 'url',
                    type: 'file',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: `input-col-sm-12 input-col-md-6`,
                    uploadAs: 'content',
                    read: 'url',
                    multiple: false,
                    maxFileSize: 10,
                    isRepeatable: false,
                    autoupload: true,
                    uploadUrl: upload_url,
                    pattern: 'application/pdf',
                    constraints: { max: 1, pattern: { fn: 'application/pdf' }, required: true },
                } as FileInput,
            ]
        },
        {
            name: 'document3',
            type: InputTypes.CONTROL_GROUP,
            containerClass: 'border bg-gray-50 border-dashsed border-gray-400 px-4 mt-4 rounded-md',
            children: [
                {
                    label: 'mariage_certificate',
                    name: 'document_id',
                    type: 'select',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: 'input-col-sm-12 input-col-md-6',
                    options: [],
                    autoselect: true,
                    optionsConfig: {
                        source: { resource: `${mariage_certificates_url}`, raw: `${mariage_certificates_url}` },
                        params: { keyBy: 'id', valueBy: 'label' },
                    },
                    constraints: { required: true },
                } as OptionsInput,
                {
                    label: 'upload_mariage_certificate',
                    // description: 'modules.beneficiaries.form.inputs.mariage_certificate.description',
                    name: 'url',
                    type: 'file',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: `input-col-sm-12 input-col-md-6`,
                    uploadAs: 'content',
                    read: 'url',
                    multiple: false,
                    maxFileSize: 10,
                    isRepeatable: false,
                    autoupload: true,
                    uploadUrl: upload_url,
                    pattern: 'application/pdf',
                    constraints: { max: 1, pattern: { fn: 'application/pdf' }, required: true },
                } as FileInput,
            ],
            constraints: { requiredIf: [{ name: 'beneficiaries.*.beneficiary_type_id', values: ['C'] }] }
        },
        {
            name: 'document4',
            type: InputTypes.CONTROL_GROUP,
            containerClass: 'border bg-gray-50 border-dashed border-gray-400 px-4 mt-4 rounded-md',
            constraints: { requiredIf: [ {name: 'beneficiaries.*.beneficiary_type_id', values: ['E']}, {name: 'beneficiaries.*.birthdate', values: 'yeardiff_gt:21'} ] },
            children: [
                {
                    label: 'school_certificate',
                    name: 'document_id',
                    type: 'select',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: 'input-col-sm-12 input-col-md-6',
                    options: [],
                    // TODO: set the document type id query parameter
                    optionsConfig: {
                        source: { resource: `${school_certificates_url}`, raw: `${school_certificates_url}` },
                        params: { keyBy: 'id', valueBy: 'label' },
                    },
                    constraints: { required: true },
                } as OptionsInput,
                {
                    label: 'upload_school_certificate',
                    // description: 'modules.beneficiaries.form.inputs.school_certificate.description',
                    name: 'url',
                    type: 'file',
                    classes: 'clr-input',
                    placeholder: '...',
                    containerClass: `input-col-sm-12 input-col-md-6`,
                    uploadAs: 'content',
                    read: 'url',
                    multiple: false,
                    maxFileSize: 10,
                    isRepeatable: false,
                    autoupload: true,
                    uploadUrl: upload_url,
                    pattern: 'application/pdf',
                    constraints: { max: 1, pattern: { fn: 'application/pdf' }, required: true },
                } as FileInput,
            ]
        },
    ] as InputConfigInterface[];
}


// @internal
function _unupdatedBeneficiaries(uploadurl: string) {
    return [
        {
            label: 'policynumber',
            name: 'policynumber',
            type: 'text',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: 'input-col-sm-12 input-col-md-12',
            constraints: { required: true, email: false, min: 1, max: 45, disabled: true },
        } as TextInput,
        {
            label: 'withdrawal_reason',
            name: 'withdrawal_reason',
            isRepeatable: false,
            type: InputTypes.SELECT_INPUT,
            placeholder: '...',
            options: WITHDRAWAL_REASONS,
            // description: '',
            constraints: { required: true },
            value: 1
        } as OptionsInput,
        {
            label: 'upload_withdrawal_document',
            description: 'description',
            name: 'url',
            type: 'file',
            classes: 'clr-input',
            placeholder: '...',
            containerClass: `input-col-sm-12 input-col-md-12`,
            uploadAs: 'content',
            read: 'url',
            multiple: false,
            maxFileSize: 10,
            isRepeatable: false,
            autoupload: true,
            uploadUrl: uploadurl,
            pattern: 'application/pdf',
            constraints: { max: 1, pattern: { fn: 'application/pdf' }, required: true },
        } as FileInput,
    ];
}

/** creates a card request form configuration */
export function createFormConfig(
    endpoints: DerivedTypeOf<{
        rightholder_types_url: string;
        countries_url: string;
        subdivisions_url: string;
        agences_api_url: string;
        card_delivery_sites_api_url: string;
        upload_url: string;
        photo_documents_url: string;
        identity_documents_url: string;
        mariage_certificates_url: string;
        school_certificates_url: string;
    }>,
    validations: { person: { maxbirthdate: string | Date; minbirthdate: string | Date } },
) {
    const { countries_url, subdivisions_url, agences_api_url, card_delivery_sites_api_url, upload_url, photo_documents_url, identity_documents_url, mariage_certificates_url, school_certificates_url } = endpoints;
    const { person: { maxbirthdate, minbirthdate } } = validations;

    return {
        controlConfigs: [
            {
                label: '',
                name: 'person_header',
                type: 'html',
                classes: 'font-semibold text-slate-900 text-xs mt-1 pt-4',
                placeholder: '...',
                value: '<section>1. Information du titulaire</section>',
                constraints: { required: false },
            } as InputConfigInterface,
            ..._person(countries_url, minbirthdate, maxbirthdate), // TODO: add photo_url property to person object
            // {
            //     label: '',
            //     name: 'document_id',
            //     type: 'select',
            //     classes: 'clr-input',
            //     placeholder: '...',
            //     isRepeatable: false,
            //     containerClass: `input-col-sm-12 input-col-md-6`,
            //     options: [],
            //     optionsConfig: {
            //         source: { resource: url, raw: url },
            //         params: { keyBy: 'id', valueBy: 'label' },
            //     },
            //     autoselect: true,
            //     constraints: { required: false },
            // } as OptionsInput,
            {
                name: 'document1',
                type: InputTypes.CONTROL_GROUP,
                containerClass: 'border bg-gray-50 border-dashed border-gray-400 px-4 mt-8 rounded-md',
                children: [
                    {
                        label: 'photo',
                        name: 'document_id',
                        type: 'select',
                        classes: 'clr-input',
                        placeholder: '...',
                        containerClass: 'input-col-sm-12 input-col-md-6',
                        autoselect: true,
                        options: [],
                        // TODO: set the document type id query parameter
                        optionsConfig: {
                            source: { resource: `${photo_documents_url}`, raw: `${photo_documents_url}` },
                            params: { keyBy: 'id', valueBy: 'label' },
                        },
                        constraints: { required: true, disabled: true },
                    } as OptionsInput,
                    {
                        label: 'upload_photo',
                        description: 'description',
                        name: 'url',
                        type: 'file',
                        classes: 'clr-input',
                        placeholder: '...',
                        containerClass: `input-col-sm-12 input-col-md-6`,
                        uploadAs: 'content',
                        read: 'url',
                        multiple: false,
                        maxFileSize: 10,
                        isRepeatable: false,
                        autoupload: true,
                        uploadUrl: upload_url,
                        pattern: 'image/jpeg,image/png,image/webp',
                        constraints: { max: 1, pattern: { fn: 'image/jpeg,image/png,image/webp' }, required: true },
                    } as FileInput,
                ]
            },
            {
                name: 'document2',
                type: InputTypes.CONTROL_GROUP,
                containerClass: 'border bg-gray-50 border-dashed border-gray-400 px-4 mt-4 rounded-md',
                children: [
                    {
                        label: 'identity_document',
                        name: 'document_id',
                        type: 'select',
                        classes: 'clr-input',
                        placeholder: '...',
                        containerClass: 'input-col-sm-12 input-col-md-6',
                        options: [],
                        // TODO: set the document type id query parameter
                        optionsConfig: {
                            source: { resource: `${identity_documents_url}`, raw: `${identity_documents_url}` },
                            params: { keyBy: 'id', valueBy: 'label' },
                        },
                        constraints: { required: true },
                    } as OptionsInput,
                    {
                        label: 'upload_identity_document',
                        description: 'description',
                        name: 'url',
                        type: 'file',
                        classes: 'clr-input',
                        placeholder: '...',
                        containerClass: `input-col-sm-12 input-col-md-6`,
                        uploadAs: 'content',
                        read: 'url',
                        multiple: false,
                        maxFileSize: 10,
                        isRepeatable: false,
                        autoupload: true,
                        uploadUrl: upload_url,
                        pattern: 'application/pdf',
                        constraints: { max: 1, pattern: { fn: 'application/pdf' }, required: true },
                    } as FileInput,
                ]
            },
            ..._address(subdivisions_url, agences_api_url, card_delivery_sites_api_url),
            {
                label: 'Souhaitez-vous procéder à la mise à jour des informations de votre dossier familial ?',
                name: 'show_beneficiaries',
                isRepeatable: false,
                type: InputTypes.HIDDEN_INPUT,
                // type: InputTypes.RADIO_INPUT,
                // options: [{ value: 1, name: 'OUI' }, { value: 2, name: 'NON' }],
                // description: '<div class="py-2 px-4 mt-1 rounded-sm border border-amber-200 bg-amber-100 text-amber-800 transition-all"><strong>Attention: </strong> Vous pourrez modifier votre dossier familial à tout moment depuis votre espace assuré. L\'accès à la nouvelle carte d\'assurance des membres de votre famille restent conditionnés à l\'actualisation complète de leur dossier<div>',
                constraints: { requiredIf: [{ name: 'has_beneficiaries', values: [1] }] },
                value: 1
            } as OptionsInput,
            {
                label: '',
                name: 'beneficiaries_header',
                type: 'html',
                classes: 'font-semibold text-slate-900 text-xs mt-1 pt-4',
                placeholder: '...',
                value: '<section>5. Bénéficiaires</section>',
                constraints: { requiredIf: [{ name: 'has_beneficiaries', values: [1] }] },
            } as InputConfigInterface,
            {
                label: 'beneficiaries',
                description: 'description',
                name: 'beneficiaries',
                isRepeatable: true,
                // classes: 'table table-edit-mode-modal',
                classes: 'control_group',
                children: beneficiary(photo_documents_url, identity_documents_url, mariage_certificates_url, school_certificates_url, upload_url, countries_url, subdivisions_url, agences_api_url, card_delivery_sites_api_url),
                constraints: {} // requiredIf: [{ name: 'show_beneficiaries', values: [1] }, { name: 'has_beneficiaries', values: [1] }]
            } as InputGroup,
            {
                label: 'unupdated_beneficiaries',
                description: 'description',
                name: 'unupdated_beneficiaries',
                isRepeatable: true,
                // classes: 'table table-edit-mode-modal',
                classes: 'control_group',
                children: _unupdatedBeneficiaries(upload_url),
                constraints: {} // requiredIf: [{ name: 'show_beneficiaries', values: [1] }, { name: 'has_beneficiaries', values: [1] }]
            } as InputGroup,
            {
                label: '',
                name: 'has_beneficiaries',
                type: 'hidden',
                value: 0
            }
        ]
    } as FormConfigInterface;
}
