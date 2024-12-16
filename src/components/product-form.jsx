import React, {useCallback, useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router';
import {createUseStyles} from 'react-jss';
import Tabs, {Tab} from './common/tabs';
import Button from './common/button';
import Icon from './common/icon';
import {Title} from './common/typography';
import TextField from './common/text-field';
import TextArea from './common/text-area';
import VariationForm from './variation-form';

const productFormStyles = createUseStyles((theme) => ({
    view: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%"
    },
    heading: {
        padding: "20px",

        "& .title": {
            display: "flex",
            gap: "10px",
            alignItems: "center",

            "& :first-child": {
                top: "-5px"
            }
        },
        "& .productInfo": {
            display: "flex",
            flexDirection: "column",
            gap: "10px",

            "& .nameID": {
                flex: "0 1 auto",
                display: "flex",
                gap: "10px",
                alignItems: "center",

                "& > *": {
                    flex: "1 1 auto"
                }
            }
        }
    },
    actions: {
        position: "absolute",
        bottom: 0,
        right: 0,
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "10px",
        backgroundColor: "transparent"
    },
    tabs: {
        flex: "0 1 100%"
    },
    tab: {
        width: "100%",
        height: "100%",
        overflowY: "auto"
    }
}));

export default function ProductForm() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({})
    useEffect(() => {
        (async () => {
            if(id) setProduct(await window.api.GET_PRODUCT_BY_ID(id));
        })();
    }, [id]);

    const addVariationForm = useCallback(() => {
        if(!product.variations) product.variations = [];
        setProduct({...product, variations: [...product.variations, {}]});
    }, [product]);
    const removeVariationForm = useCallback(position => {
        const variations = product.variations.filter((_, index) => index !== position);
        setProduct({...product, variations});
    }, [product]);

    const handleVariationForm = useCallback((variation, position) => {
        const variations = product.variations;
        variations[position] = variation;
        setProduct({...product, variations});
    }, [product]);
    
    const [errors, setErrors] = useState({});
    const saveProduct = useCallback(() => {
        if(id) {
            console.log(`Saving Product to ID: ${id} with data ${product.id}`);
            const {id: newID, name, variations} = product;
            const errors = {
                id: newID? false : true,
                name: name? false : true,
                variations: []
            }
            variations?.forEach(({finishes, tags}) => {
                errors.variations.push({
                    finishes: finishes?.length > 0? false : true,
                    tags: tags?.length > 0 && tags?.some(({category}) => category === "Class")? false : true
                });
            });
            const errors_variations = errors.variations.length > 0? errors.variations.reduce((error, {finishes, tags}) => error || finishes || tags, false) : true;

            if(!(errors.id || errors.name || errors_variations)) {
                window.api.UPDATE_PRODUCT_BY_ID(id, product);
                setErrors({});
            } else
                setErrors(errors);
        } else {
            console.log(`Creating Product on ID: ${product.id}`);
            const {id, name, variations} = product;
            const errors = {
                id: id? false : true,
                name: name? false : true,
                variations: []
            }
            variations?.forEach(({finishes, tags}) => {
                errors.variations.push({
                    finishes: finishes?.length > 0? false : true,
                    tags: tags?.length > 0 && tags?.some(({category}) => category === "Class")? false : true
                });
            });
            const errors_variations = errors.variations.length > 0? errors.variations.reduce((error, {finishes, tags}) => error || finishes || tags, false) : true;

            if(!(errors.id || errors.name || errors_variations)) {
                window.api.CREATE_NEW_PRODUCT(product);
                setErrors({});
            } else
                setErrors(errors);
        }
    }, [id, product]);

    const styles = productFormStyles();
    return (
        <section className={styles.view}>
            <div className={styles.heading}>
                <div className="title">
                    <Icon icon="arrow_back" role="secondary" button onPress={() => navigate(-1)}/>
                    <Title>Product View</Title>
                </div>
                <div className="productInfo">
                    <div className="nameID">
                        <TextField label="Product Name" required placeholder="Loft Light" value={product.name} onChange={name => setProduct({...product, name})} error={errors.name} />
                        <TextField label="Product ID" required placeholder="UA0034-IS" value={product.id} onChange={id => setProduct({...product, id})} error={errors.id} />
                    </div>
                    <TextArea label="Product Description" value={product.description} onChange={description => setProduct({...product, description})} />
                </div>
            </div>
            <Tabs className={styles.tabs} add={addVariationForm}>
                {product.variations?.map((variation, index) => (
                    <Tab key={index} className={styles.tab} name={variation.subname === ""? "Default" : variation.subname?? "Default"} button={<Icon icon="close" button onPress={() => removeVariationForm(index)} />}>
                        <VariationForm variationData={variation} onChange={variation => handleVariationForm(variation, index)} errors={errors.variations?.      [index]} />
                    </Tab>
                ))}
            </Tabs>
            <div className={styles.actions}>
                <Icon icon="delete" button role="secondary" appearance='tonal' />
                <Button icon={<Icon icon="save" />} role="secondary" onPress={saveProduct}>Save</Button>
            </div>
        </section>
    );
}