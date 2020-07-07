package v1alpha1

import (
	pipelinev1beta1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1beta1"
	resourcev1alpha1 "github.com/tektoncd/pipeline/pkg/apis/resource/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// +k8s:openapi-gen=true
type Build struct {
	metav1.TypeMeta `json:",inline"`
	// +optional
	metav1.ObjectMeta `json:"metadata,omitempty"`
	// +optional
	Spec BuildSpec `json:"spec,omitempty"`
	// +optional
	Status BuildStatus `json:"status,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

type BuildList struct {
	metav1.TypeMeta `json:",inline"`
	// +optional
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Build `json:"items"`
}

type BuildSpec struct {
	ServiceAccountName   string                                `json:"serviceAccountName"`
	PipelineResourceSpec resourcev1alpha1.PipelineResourceSpec `json:"pipelineResourceSpec"`
	PipelineSpec         pipelinev1beta1.PipelineSpec          `json:"pipelineSpec"`
	Params               []pipelinev1beta1.Param               `json:"params"`
}

type BuildStatus struct {
	PipelineRun *pipelinev1beta1.PipelineRunStatus `json:"pipelineRun"`
}
