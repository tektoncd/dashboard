package endpoints

import (
	"encoding/json"
	"github.com/google/go-cmp/cmp"
	"github.com/stretchr/testify/assert"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"
)

func Test_SingleItem_PVC(t *testing.T) {
	type args struct {
		value string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"single item 1",
			args{"/api/v1/namespaces/{namespace}/persistentvolumeclaims/{name}"},
			true},
		{"single item 2",
			args{"/api/v1/namespaces/tekton/persistentvolumeclaims/name"},
			true},
		{"multiple items",
			args{"/api/v1/namespaces/tekton/persistentvolumeclaims/"},
			false},
		{"multiple items no slash",
			args{"/api/v1/namespaces/tekton/persistentvolumeclaims"},
			false},
		{"multiple items upper",
			args{"/api/v1/namespaces/tekton/PersistentVolumeClaims"},
			false},
		{"multiple items",
			args{"/api/v1/persistentvolumeclaims"},
			false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := singleItem.MatchString(tt.args.value); got != tt.want {
				t.Errorf("respArgs() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_SingleItem_Secrets(t *testing.T) {
	type args struct {
		value string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"single item 1",
			args{"/api/v1/namespaces/{namespace}/secrets/{name}"},
			true},
		{"single item 2",
			args{"/api/v1/namespaces/tekton/secrets/name"},
			true},
		{"multiple items",
			args{"/api/v1/namespaces/tekton/secrets/"},
			false},
		{"multiple items no slash",
			args{"/api/v1/namespaces/tekton/secrets"},
			false},
		{"multiple items upper",
			args{"/api/v1/namespaces/tekton/SECRETS"},
			false},
		{"multiple items",
			args{"/api/v1/secrets"},
			false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := singleItem.MatchString(tt.args.value); got != tt.want {
				t.Errorf("respArgs() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_SingleItem_ConfigMaps(t *testing.T) {
	type args struct {
		value string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"single item 1",
			args{"/api/v1/namespaces/{namespace}/configmaps/{name}"},
			true},
		{"single item 2",
			args{"/api/v1/namespaces/tekton/configmaps/name"},
			true},
		{"multiple items",
			args{"/api/v1/namespaces/tekton/configmaps/"},
			false},
		{"multiple items no slash",
			args{"/api/v1/namespaces/tekton/configmaps"},
			false},
		{"multiple items upper",
			args{"/api/v1/namespaces/tekton/CONFIGMAPS"},
			false},
		{"multiple items",
			args{"/api/v1/configmaps"},
			false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := singleItem.MatchString(tt.args.value); got != tt.want {
				t.Errorf("respArgs() = %v, want %v", got, tt.want)
			}
		})
	}
}

type want struct {
	statusCode int
	fileName   string
}

func TestInterceptor(t *testing.T) {
	tests := []struct {
		name string
		args respArgs
		want want
	}{
		{"List. Body contains only necessary data without sensitive fields",
			respArgs{".test/k8s_secrets_test.json", 200,
				"/api/v1/namespaces/tekton-namespace/secrets"},
			want{200, ".test/k8s_secrets_test_expected.json"}},
		{"Get. Body contains only necessary data without sensitive fields",
			respArgs{".test/k8s_configmap_test.json", 200,
				"/api/v1/namespaces/tekton-namespace/configmaps/kube-root-ca.crt"},
			want{200, ".test/k8s_configmap_test_expected.json"},
		},
		{"Get Decode Failure. Custom error",
			respArgs{".test/k8s_configmap_incorrect_test.json", 200,
				"/api/v1/namespaces/tekton-namespace/configmaps/kube-root-ca.crt"},
			want{500, ".test/k8s_configmap_incorrect_test_expected.txt"},
		},
		{"List Decode Failure. Custom error",
			respArgs{".test/k8s_secrets_incorrect_test.json", 200,
				"/api/v1/namespaces/tekton-namespace/secrets"},
			want{500, ".test/k8s_secrets_incorrect_test_expected.txt"},
		},
		{"Get. K8s returns failure. Return original error",
			respArgs{".test/k8s_status.json", 403,
				"/api/v1/namespaces/tekton-namespace/configmaps/kube-root-ca.crt"},
			want{403, ".test/k8s_status.json"},
		},
		{"List. K8s returns failure. Return original error",
			respArgs{".test/k8s_status.json", 403,
				"/api/v1/namespaces/tekton-namespace/secrets"},
			want{403, ".test/k8s_status.json"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			//given
			serverURLStr := serverMock(tt.args).URL
			serverURL, err := url.Parse(serverURLStr)
			assert.NoError(t, err)
			client := &http.Client{}
			client.Transport = NewK8sInterceptor(http.DefaultTransport, serverURL)

			// when
			response, err := client.Get(serverURLStr + tt.args.apiPath)
			assert.NoError(t, err)

			//then
			actual, err := io.ReadAll(response.Body)
			assert.NoError(t, err)
			// in case if needed to update expected result
			//os.WriteFile(tt.want.fileName, actual, os.ModePerm)
			expected, err := os.ReadFile(tt.want.fileName)
			assert.NoError(t, err)
			if strings.HasSuffix(tt.want.fileName, ".json") {
				var actualJson interface{}
				err = json.Unmarshal(actual, &actualJson)
				assert.NoError(t, err)

				assert.NoError(t, err)
				var expectedJson interface{}
				err = json.Unmarshal(expected, &expectedJson)
				assert.NoError(t, err)
				if diff := cmp.Diff(expectedJson, actualJson); diff != "" {
					t.Errorf("mismatch (-want +got):\n%s", diff)
				}
			} else {
				assert.Equal(t, strings.TrimSuffix(string(actual), "\n"), strings.TrimSuffix(string(expected), "\n"))
			}

			assert.Equal(t, tt.want.statusCode, response.StatusCode)
			// then original k8s response headers preserved
			assert.Equal(t, "value", response.Header.Get("X-Test"))

		})
	}
}

func serverMock(t respArgs) *httptest.Server {
	handler := http.NewServeMux()
	handler.HandleFunc(t.apiPath, t.clientResponseMock)

	srv := httptest.NewServer(handler)

	return srv
}

type respArgs struct {
	responseFileName string
	responseHeader   int
	apiPath          string
}

func (ra respArgs) clientResponseMock(w http.ResponseWriter, r *http.Request) {
	testInputHeader := r.Header.Get("ignored_header")
	if testInputHeader != "" {
		panic("header 'ignored_header' should be empty (no headers redirected), got " + testInputHeader)
	}
	content, err := os.ReadFile(ra.responseFileName)
	if err != nil {
		panic(err)
	}
	w.Header().Set("X-Test", "value")
	w.WriteHeader(ra.responseHeader)
	_, err = w.Write(content)
	if err != nil {
		panic(err)
	}
}

func Test_SensitiveAPIPattern_Secrets(t *testing.T) {
	type args struct {
		value string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"prohibit one",
			args{"/api/v1/namespaces/{namespace}/secrets/{name}"},
			true},
		{"prohibit one 2",
			args{"/api/v1/namespaces/tekton/secrets/name"},
			true},
		{"prohibit",
			args{"/api/v1/namespaces/tekton/secrets/"},
			true},
		{"prohibit no slash",
			args{"/api/v1/namespaces/tekton/secrets"},
			true},
		{"prohibit upper case",
			args{"/api/v1/namespaces/tekton/SECRETS"},
			true},
		{"prohibit all no slash",
			args{"/api/v1/secrets"},
			true},
		{"prohibit all with more slashes",
			args{"/api/v1///secrets"},
			true},
		{"prohibit all upper case",
			args{"/api/v1/SECRETS"},
			true},
		{"prohibit all future v2 version ",
			args{"/api/v2/secrets"},
			true},
		{"prohibit sensitive with 'secrets' namespace name",
			args{"/api/v1/namespaces/secrets/secrets"},
			true},
		{"prohibit non-sensitive with 'secrets' namespace name for future v2 version (modify pattern manually)",
			args{"/api/v2/namespaces/secrets/pipelineruns"},
			true},
		{"prohibit with namespace 'configmaps'",
			args{"/api/v1/namespaces/configmaps/secrets"},
			true},
		{"prohibit non-sensitive with 'secrets' namespace name. This is false-positive, wont fix",
			args{"/api/v1/namespaces/secrets/pipelineruns"},
			true},
		{"allow non-sensitive",
			args{"/api/v1/namespaces/test/pipelineruns"},
			false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parse, err := url.Parse(tt.args.value)
			if err != nil {
				t.Error(err)
			}
			if got := isSensitive(parse); got != tt.want {
				t.Errorf("test() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_SensitiveAPIPattern_ConfigMaps(t *testing.T) {
	type args struct {
		value string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"prohibit one",
			args{"/api/v1/namespaces/{namespace}/configmaps/{name}"},
			true},
		{"prohibit one",
			args{"/api/v1/namespaces/tekton/configmaps/name"},
			true},
		{"prohibit",
			args{"/api/v1/namespaces/tekton/configmaps/"},
			true},
		{"prohibit no slash",
			args{"/api/v1/namespaces/tekton/configmaps"},
			true},
		{"prohibit case-sensitive",
			args{"/api/v1/namespaces/tekton/CONFIGMAPS"},
			true},
		{"prohibit all no slash",
			args{"/api/v1/secrets"},
			true},
		{"prohibit all with more slashes",
			args{"/api/v1///secrets"},
			true},
		{"prohibit all upper case",
			args{"/api/v1/SECRETS"},
			true},
		{"prohibit all future v2 version ",
			args{"/api/v2/secrets"},
			true},
		{"prohibit sensitive with 'configmap' namespace name",
			args{"/api/v1/namespaces/configmaps/configmaps"},
			true},
		{"prohibit non-sensitive with 'configmap' namespace name for future v2 version (modify pattern manually)",
			args{"/api/v2/namespaces/configmaps/pipelineruns"},
			true},
		{"prohibit non-sensitive with 'configmap' namespace name. This is false-positive, wont fix",
			args{"/api/v1/namespaces/configmaps/pipelineruns"},
			true},
		{"allow non-sensitive",
			args{"/api/v1/namespaces/test/pipelineruns"},
			false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parse, err := url.Parse(tt.args.value)
			if err != nil {
				t.Error(err)
			}
			if got := isSensitive(parse); got != tt.want {
				t.Errorf("test() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_SensitiveAPIPattern_PVC(t *testing.T) {
	type args struct {
		value string
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"prohibit one",
			args{"/api/v1/namespaces/{namespace}/persistentvolumeclaims/{name}"},
			true},
		{"prohibit one",
			args{"/api/v1/namespaces/tekton/persistentvolumeclaims/name"},
			true},
		{"prohibit",
			args{"/api/v1/namespaces/tekton/persistentvolumeclaims/"},
			true},
		{"prohibit no slash",
			args{"/api/v1/namespaces/tekton/persistentvolumeclaims"},
			true},
		{"prohibit case-sensitive",
			args{"/api/v1/namespaces/tekton/PersistentVolumeClaims"},
			true},
		{"prohibit all no slash",
			args{"/api/v1/persistentvolumeclaims"},
			true},
		{"prohibit all with more slashes",
			args{"/api/v1///persistentvolumeclaims"},
			true},
		{"prohibit all upper case",
			args{"/api/v1/PersistentVolumeClaims"},
			true},
		{"prohibit all future v2 version ",
			args{"/api/v2/persistentvolumeclaims"},
			true},
		{"prohibit sensitive with 'configmap' namespace name",
			args{"/api/v1/namespaces/configmaps/persistentvolumeclaims"},
			true},
		{"prohibit non-sensitive with 'persistentvolumeclaims' namespace name for future v2 version (modify pattern manually)",
			args{"/api/v2/namespaces/persistentvolumeclaims/pipelineruns"},
			true},
		{"prohibit non-sensitive with 'persistentvolumeclaims' namespace name. This is false-positive, wont fix",
			args{"/api/v1/namespaces/persistentvolumeclaims/pipelineruns"},
			true},
		{"allow non-sensitive",
			args{"/api/v1/namespaces/test/pipelineruns"},
			false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parse, err := url.Parse(tt.args.value)
			if err != nil {
				t.Error(err)
			}
			if got := isSensitive(parse); got != tt.want {
				t.Errorf("test() = %v, want %v", got, tt.want)
			}
		})
	}
}
