"use client";

import React, { useState } from "react";
import { Button, Modal, Select, Input, Space, Typography, App } from "antd";
import { QuestionReportCategory, QuestionReportSubcategory, QuestionReportData } from "@/types/question-report.types";

interface QuestionReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reportData: QuestionReportData) => Promise<void>;
    questionBookId: string;
    questionBookQuestionId: string;
}

// Mapeamento das categorias e subcategorias baseado nos enums
const reportCategories = {
    [QuestionReportCategory.ERROR_TEXT]: {
        label: QuestionReportCategory.ERROR_TEXT,
        subcategories: {
            [QuestionReportSubcategory.GRAMMAR]: QuestionReportSubcategory.GRAMMAR,
            [QuestionReportSubcategory.SPELLING]: QuestionReportSubcategory.SPELLING,
            [QuestionReportSubcategory.FORMULATION]: QuestionReportSubcategory.FORMULATION,
            [QuestionReportSubcategory.INCOMPLETE]: QuestionReportSubcategory.INCOMPLETE,
            [QuestionReportSubcategory.IMAGE_NOT_SHOWING]: QuestionReportSubcategory.IMAGE_NOT_SHOWING,
            [QuestionReportSubcategory.IMAGE_ILLEGIBLE]: QuestionReportSubcategory.IMAGE_ILLEGIBLE,
            [QuestionReportSubcategory.NO_STATEMENT]: QuestionReportSubcategory.NO_STATEMENT,
            [QuestionReportSubcategory.OTHER_TEXT_ERROR]: QuestionReportSubcategory.OTHER_TEXT_ERROR,
        }
    },
    [QuestionReportCategory.ANSWER_KEY]: {
        label: QuestionReportCategory.ANSWER_KEY,
        subcategories: {
            [QuestionReportSubcategory.INCORRECT_ANSWER_KEY]: QuestionReportSubcategory.INCORRECT_ANSWER_KEY,
            [QuestionReportSubcategory.ILLEGIBLE_ANSWER_KEY]: QuestionReportSubcategory.ILLEGIBLE_ANSWER_KEY,
            [QuestionReportSubcategory.ANSWER_KEY_NOT_SHOWING]: QuestionReportSubcategory.ANSWER_KEY_NOT_SHOWING,
        }
    },
    [QuestionReportCategory.ERROR_ALTERNATIVES]: {
        label: QuestionReportCategory.ERROR_ALTERNATIVES,
        subcategories: {
            [QuestionReportSubcategory.DUPLICATE_ALTERNATIVE]: QuestionReportSubcategory.DUPLICATE_ALTERNATIVE,
            [QuestionReportSubcategory.MISSING_ALTERNATIVE]: QuestionReportSubcategory.MISSING_ALTERNATIVE,
            [QuestionReportSubcategory.INCORRECT_ALTERNATIVE]: QuestionReportSubcategory.INCORRECT_ALTERNATIVE,
            [QuestionReportSubcategory.ILLEGIBLE_ALTERNATIVE]: QuestionReportSubcategory.ILLEGIBLE_ALTERNATIVE,
        }
    },
    [QuestionReportCategory.ERROR_COMMENT]: {
        label: QuestionReportCategory.ERROR_COMMENT,
        subcategories: {
            [QuestionReportSubcategory.INCORRECT_EXPLANATION]: QuestionReportSubcategory.INCORRECT_EXPLANATION,
            [QuestionReportSubcategory.INCOMPLETE_EXPLANATION]: QuestionReportSubcategory.INCOMPLETE_EXPLANATION,
            [QuestionReportSubcategory.CONFUSING_EXPLANATION]: QuestionReportSubcategory.CONFUSING_EXPLANATION,
            [QuestionReportSubcategory.COMMENT_IMAGE_NOT_SHOWING]: QuestionReportSubcategory.COMMENT_IMAGE_NOT_SHOWING,
            [QuestionReportSubcategory.COMMENT_IMAGE_ILLEGIBLE]: QuestionReportSubcategory.COMMENT_IMAGE_ILLEGIBLE,
            [QuestionReportSubcategory.NO_COMMENT]: QuestionReportSubcategory.NO_COMMENT,
        }
    },
    [QuestionReportCategory.TECHNICAL_PROBLEM]: {
        label: QuestionReportCategory.TECHNICAL_PROBLEM,
        subcategories: {
            [QuestionReportSubcategory.NOT_LOADING]: QuestionReportSubcategory.NOT_LOADING,
            [QuestionReportSubcategory.WRONG_FORMAT]: QuestionReportSubcategory.WRONG_FORMAT,
            [QuestionReportSubcategory.BROKEN_IMAGE]: QuestionReportSubcategory.BROKEN_IMAGE,
            [QuestionReportSubcategory.SLOW_LOADING]: QuestionReportSubcategory.SLOW_LOADING,
        }
    },
    [QuestionReportCategory.OTHER]: {
        label: QuestionReportCategory.OTHER,
        subcategories: {
            [QuestionReportSubcategory.SUGGESTION]: QuestionReportSubcategory.SUGGESTION,
            [QuestionReportSubcategory.DOUBT]: QuestionReportSubcategory.DOUBT,
        }
    }
};

export function QuestionReportModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    questionBookId, 
    questionBookQuestionId 
}: QuestionReportModalProps) {
    const [reportCategory, setReportCategory] = useState<QuestionReportCategory | "">("");
    const [reportSubcategory, setReportSubcategory] = useState<QuestionReportSubcategory | "">("");
    const [reportDescription, setReportDescription] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const app = App.useApp?.();

    const handleSubmit = async () => {
        if (!reportCategory || !reportSubcategory) {
            app?.message.warning("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const reportData: QuestionReportData = {
                questionBookId,
                questionBookQuestionId,
                category: reportCategory as QuestionReportCategory,
                subcategory: reportSubcategory as QuestionReportSubcategory,
                description: reportDescription.trim()
            };
            
            await onSubmit(reportData);
            
            app?.message.success("Reporte enviado com sucesso! Obrigado pelo feedback.");
            handleClose();
            
        } catch (error) {
            console.error('Erro ao enviar reporte:', error);
            return;
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCategoryChange = (value: QuestionReportCategory) => {
        setReportCategory(value);
        setReportSubcategory(""); 
    };
    
    const handleClose = () => {
        setReportCategory("");
        setReportSubcategory("");
        setReportDescription("");
        onClose();
    };

    return (
        <Modal
            title="Reportar Erro na Questão"
            open={isOpen}
            onCancel={handleClose}
            footer={[
                <Button 
                    key="cancel" 
                    onClick={handleClose}
                >
                    Cancelar
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    loading={isSubmitting}
                    onClick={handleSubmit}
                    disabled={!reportCategory || !reportSubcategory}
                >
                    Enviar Reporte
                </Button>
            ]}
            width={600}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Typography.Text strong>1. Categoria do problema:</Typography.Text>
                    <Select
                        placeholder="Selecione uma categoria"
                        value={reportCategory || undefined}
                        onChange={handleCategoryChange}
                        style={{ width: '100%', marginTop: 8 }}
                        options={Object.entries(reportCategories).map(([key, value]) => ({
                            value: key,
                            label: value.label
                        }))}
                    />
                </div>
                
                {reportCategory && (
                    <div>
                        <Typography.Text strong>2. Tipo específico:</Typography.Text>
                        <Select
                            placeholder="Selecione o tipo específico"
                            value={reportSubcategory || undefined}
                            onChange={setReportSubcategory}
                            style={{ width: '100%', marginTop: 8 }}
                            options={Object.entries(reportCategories[reportCategory as keyof typeof reportCategories].subcategories).map(([key, value]) => ({
                                value: key,
                                label: value
                            }))}
                        />
                    </div>
                )}
                
                {reportSubcategory && (
                    <div>
                        <Typography.Text strong>3. Descrição adicional:</Typography.Text>
                        <Input.TextArea
                            placeholder="Descreva o problema encontrado com o máximo de detalhes possível..."
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            rows={4}
                            style={{ marginTop: 8, marginBottom: 16 }}
                            maxLength={500}
                            showCount
                        />
                    </div>
                )}
            </Space>
        </Modal>
    );
}
