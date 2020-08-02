package endpoints

import (
	"net/http"
	"net/url"

	restful "github.com/emicklei/go-restful"
	"github.com/tektoncd/dashboard/pkg/utils"
)

func (r Resource) LogsProxy(request *restful.Request, response *restful.Response) {
	parsedURL, err := url.Parse(request.Request.URL.String())
	if err != nil {
		utils.RespondError(response, err, http.StatusNotFound)
		return
	}

	uri := request.PathParameter("subpath") + "?" + parsedURL.RawQuery

	if statusCode, err := utils.Proxy(request.Request, response, r.Options.ExternalLogsURL+"/"+uri, http.DefaultClient); err != nil {
		utils.RespondError(response, err, statusCode)
	}
}
