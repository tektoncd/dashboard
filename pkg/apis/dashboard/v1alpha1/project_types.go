package v1alpha1

import (
	pipelinev1beta1 "github.com/tektoncd/pipeline/pkg/apis/pipeline/v1beta1"
	triggersv1alpha1 "github.com/tektoncd/triggers/pkg/apis/triggers/v1alpha1"
	extensionsv1beta1 "k8s.io/api/extensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// +k8s:openapi-gen=true
type Project struct {
	metav1.TypeMeta `json:",inline"`
	// +optional
	metav1.ObjectMeta `json:"metadata,omitempty"`
	// +optional
	Spec ProjectSpec `json:"spec,omitempty"`
	// +optional
	Status ProjectStatus `json:"status,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

type ProjectList struct {
	metav1.TypeMeta `json:",inline"`
	// +optional
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Project `json:"items"`
}

type ProjectSpec struct {
	ServiceAccountName string                               `json:"serviceAccountName"`
	Ingress            *Ingress                             `json:"ingress"`
	TriggerTemplate    triggersv1alpha1.TriggerTemplateSpec `json:"triggerTemplate"`
	TriggerBinding     triggersv1alpha1.TriggerBindingSpec  `json:"triggerBinding"`
	Interceptors       []*triggersv1alpha1.EventInterceptor `json:"interceptors"`
}

type ProjectStatus struct {
	TriggerTemplate *triggersv1alpha1.TriggerTemplateStatus   `json:"triggerTemplate"`
	TriggerBinding  *triggersv1alpha1.TriggerBindingStatus    `json:"triggerBinding"`
	EventListener   *triggersv1alpha1.EventListenerStatus     `json:"eventListener"`
	Ingress         *extensionsv1beta1.IngressStatus          `json:"ingress"`
	TaskRuns        map[string]*pipelinev1beta1.TaskRunStatus `json:"taskRuns"`
	Builds          map[string]*BuildStatus                   `json:"builds,omitempty"`
}

type Ingress struct {
	Host        string            `json:"host"`
	Annotations map[string]string `json:"annotations"`
	Labels      map[string]string `json:"labels"`
}

// project -> taskrun -> build -> taskrun -> pipelinerun
