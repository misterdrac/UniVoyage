package com.univoyage.currency.client;

import com.univoyage.currency.config.ExchangeRateApiProperties;
import com.univoyage.exception.ExternalServiceException;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ExchangeRateHttpClientTest {

    @Test
    void fetchPairRate_returnsConversionRateOnSuccess() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        RestClient restClient = builder.build();
        ExchangeRateApiProperties props = new ExchangeRateApiProperties(
                "test-api-key",
                "https://v6.exchangerate-api.com/v6"
        );
        ExchangeRateHttpClient client = new ExchangeRateHttpClient(restClient, props);

        server.expect(requestTo("https://v6.exchangerate-api.com/v6/test-api-key/pair/EUR/USD"))
                .andRespond(withSuccess(
                        """
                                {"result":"success","conversion_rate":1.08}
                                """,
                        MediaType.APPLICATION_JSON
                ));

        assertThat(client.fetchPairRate("eur", "usd")).isEqualTo(1.08);
        server.verify();
    }

    @Test
    void fetchPairRate_throwsWhenApiKeyMissing() {
        RestClient plain = RestClient.builder().build();
        ExchangeRateApiProperties emptyKey = new ExchangeRateApiProperties(null, "https://v6.exchangerate-api.com/v6");
        ExchangeRateHttpClient noKeyClient = new ExchangeRateHttpClient(plain, emptyKey);

        assertThrows(ExternalServiceException.class, () -> noKeyClient.fetchPairRate("EUR", "USD"));
    }
}
