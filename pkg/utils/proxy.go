package utils

import (
	"io"
	"net/http"

	logging "github.com/tektoncd/dashboard/pkg/logging"
)

func Proxy(request *http.Request, response http.ResponseWriter, url string, client *http.Client) (int, error) {
	req, err := http.NewRequest(request.Method, url, request.Body)

	if err != nil {
		logging.Log.Errorf("Failed to create request: %s", err)
		return http.StatusInternalServerError, err
	}

	req = req.WithContext(request.Context())

	req.Header.Set("Content-Type", request.Header.Get("Content-Type"))

	resp, err := client.Do(req)
	defer func() {
		if resp != nil && resp.Body != nil {
			resp.Body.Close()
		}
	}()

	if err != nil {
		logging.Log.Errorf("Failed to execute request: %s", err)
		return resp.StatusCode, err
	}

	for name, values := range resp.Header {
		for _, value := range values {
			response.Header().Add(name, value)
		}
	}
	response.WriteHeader(resp.StatusCode)
	contentLength := resp.Header.Get("Content-Length")
	if contentLength == "" {
		io.Copy(MakeFlushWriter(response), resp.Body)
	} else {
		io.Copy(response, resp.Body)
	}
	logging.Log.Debugf("END OF REQUEST: %s", url)

	return resp.StatusCode, nil
}
